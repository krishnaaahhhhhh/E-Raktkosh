import express from 'express';
import http from 'http';
import path from 'path';
import { Server as SocketIOServer } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import { INITIAL_HOSPITALS } from './src/lib/initialData';
import { HospitalFacility, InboundDispatch } from './src/types';
import {
  connectToDatabase,
  isDbConnected,
  FacilityModel,
  DispatchModel,
  TokenModel,
  PlannedAdmissionModel,
  HospitalBedStateModel,
  TelemetryLogModel
} from './server/db';

const app = express();
const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Authoritative in-memory state for instant low-latency delivery
const hospitalsState: Record<string, HospitalFacility> = JSON.parse(JSON.stringify(INITIAL_HOSPITALS));

// Initialize MongoDB on startup (non-blocking)
connectToDatabase().catch((err) => console.warn('[MongoDB] Init connection error:', err));

// =========================================================================
// REST API ENDPOINTS (Saved into MongoDB Atlas & Broadcasted via Socket.io)
// =========================================================================

// 1. Health & Database Diagnostic Endpoint
app.get('/api/health', async (req, res) => {
  const dbConnected = isDbConnected();
  let counts = { facilities: 0, dispatches: 0, tokens: 0, admissions: 0 };

  if (dbConnected) {
    try {
      const [facCount, dispCount, tokCount, admCount] = await Promise.all([
        FacilityModel.countDocuments(),
        DispatchModel.countDocuments(),
        TokenModel.countDocuments(),
        PlannedAdmissionModel.countDocuments()
      ]);
      counts = { facilities: facCount, dispatches: dispCount, tokens: tokCount, admissions: admCount };
    } catch {
      // ignore
    }
  }

  res.json({
    status: 'ok',
    system: 'Prathmikta Emergency Cloud Core',
    socketConnections: io.engine.clientsCount,
    database: {
      provider: 'MongoDB Atlas',
      connected: dbConnected,
      counts
    },
    activeHospitals: Object.keys(hospitalsState).length,
    timestamp: new Date().toISOString()
  });
});

// 2. ABDM Partner Registration Endpoint (/hb route)
app.post('/api/partner/register', async (req, res) => {
  try {
    const facilityData = req.body;
    console.log(`[API/Socket] Saving facility registration: ${facilityData.facilityName} (${facilityData.facilityType})`);

    // Persist to MongoDB
    let savedDoc = null;
    if (isDbConnected()) {
      savedDoc = await FacilityModel.findOneAndUpdate(
        { facilityId: facilityData.facilityId },
        { ...facilityData, updatedAt: new Date() },
        { upsert: true, new: true }
      );
    }

    const payload = savedDoc || facilityData;

    // Real-time broadcast to all connected dashboards via Socket.io
    io.emit('facility:registered', payload);
    io.emit('partner:facility_added', payload);

    res.status(201).json({
      success: true,
      message: 'Facility registered successfully and synced with National Emergency Grid',
      facility: payload
    });
  } catch (error) {
    console.error('[API] Facility registration error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get('/api/partner/facilities', async (req, res) => {
  try {
    if (isDbConnected()) {
      const facilities = await FacilityModel.find().sort({ createdAt: -1 }).limit(50);
      return res.json(facilities);
    }
    res.json([]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// 3. Hospital List & Details
app.get('/api/hospitals', (req, res) => {
  res.json(Object.values(hospitalsState));
});

app.get('/api/hospital/:id', (req, res) => {
  const hospital = hospitalsState[req.params.id];
  if (!hospital) {
    return res.status(404).json({ error: 'Hospital facility not found' });
  }
  res.json(hospital);
});

// 4. Emergency Citizen Triage & Inbound Ambulance Dispatch (/patient & /split routes)
app.post('/api/dispatch', async (req, res) => {
  const dispatchPayload: InboundDispatch = req.body;
  const hospital = hospitalsState[dispatchPayload.hospitalId];
  if (!hospital) {
    return res.status(404).json({ error: 'Target hospital facility not found' });
  }

  // Idempotent in-memory update
  const existingIdx = hospital.activeDispatches.findIndex((d) => d.dispatchId === dispatchPayload.dispatchId);
  if (existingIdx >= 0) {
    hospital.activeDispatches[existingIdx] = dispatchPayload;
  } else {
    hospital.activeDispatches.unshift(dispatchPayload);
  }

  // Persist to MongoDB
  if (isDbConnected()) {
    try {
      await DispatchModel.findOneAndUpdate(
        { dispatchId: dispatchPayload.dispatchId },
        {
          dispatchId: dispatchPayload.dispatchId,
          hospitalId: dispatchPayload.hospitalId,
          hospitalName: hospital.name,
          patientName: dispatchPayload.patient?.fullName || 'Emergency Citizen',
          patientAge: dispatchPayload.patient?.age,
          patientGender: dispatchPayload.patient?.gender,
          contactPhone: dispatchPayload.patient?.contactPhone,
          severity: dispatchPayload.severity,
          symptomCategory: dispatchPayload.patient?.symptomCategory,
          subSymptoms: dispatchPayload.patient?.subSymptoms,
          onsetTime: dispatchPayload.patient?.onsetTime,
          avpuScale: dispatchPayload.patient?.avpuScale,
          vitals: dispatchPayload.patient?.vitals,
          etaMinutes: dispatchPayload.etaMinutes,
          status: dispatchPayload.status,
          assignedBay: dispatchPayload.assignedBay,
          assignedDoctor: dispatchPayload.assignedDoctor,
          targetDepartment: dispatchPayload.patient?.targetDepartment,
          clinicalPriorityNotes: dispatchPayload.patient?.clinicalPriorityNotes,
          originCoords: dispatchPayload.originCoords,
          currentCoords: dispatchPayload.currentCoords
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.warn('[MongoDB] Error storing dispatch:', (err as Error).message);
    }
  }

  // Broadcast to realtime WebSocket rooms
  io.to(`hospital:${dispatchPayload.hospitalId}`).emit('patient:inbound_received', dispatchPayload);
  io.to(`city:${hospital.city}`).emit('city:dispatch_broadcast', {
    hospitalId: hospital.id,
    dispatch: dispatchPayload
  });
  io.emit('global:dispatch_update', dispatchPayload);

  res.status(201).json({ success: true, dispatch: dispatchPayload });
});

app.get('/api/dispatches', async (req, res) => {
  try {
    if (isDbConnected()) {
      const dispatches = await DispatchModel.find().sort({ createdAt: -1 }).limit(100);
      return res.json(dispatches);
    }
    // Fallback from memory
    const memoryDispatches = Object.values(hospitalsState).flatMap((h) => h.activeDispatches);
    res.json(memoryDispatches);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// 5. ₹500 Fast-Track Emergency Desk Tokens (/h route)
app.post('/api/tokens', async (req, res) => {
  try {
    const tokenData = req.body;
    console.log(`[API/Socket] Saving ₹500 token: ${tokenData.tokenNumber}`);

    let savedDoc = null;
    if (isDbConnected()) {
      savedDoc = await TokenModel.findOneAndUpdate(
        { tokenNumber: tokenData.tokenNumber },
        tokenData,
        { upsert: true, new: true }
      );
    }

    const payload = savedDoc || tokenData;

    // Real-time broadcast via Socket.io
    io.to(`hospital:${tokenData.hospitalId || 'gsvm-kanpur'}`).emit('token:new', payload);
    io.emit('token:issued', payload);

    res.status(201).json({ success: true, token: payload });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get('/api/tokens', async (req, res) => {
  try {
    if (isDbConnected()) {
      const tokens = await TokenModel.find().sort({ createdAt: -1 }).limit(50);
      return res.json(tokens);
    }
    res.json([]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// 6. Planned Admissions / OPD Bookings (/planned-admission route)
app.post('/api/planned-admissions', async (req, res) => {
  try {
    const bookingData = req.body;
    console.log(`[API/Socket] Saving planned admission: ${bookingData.bookingId} for ${bookingData.patientName}`);

    let savedDoc = null;
    if (isDbConnected()) {
      savedDoc = await PlannedAdmissionModel.findOneAndUpdate(
        { bookingId: bookingData.bookingId },
        bookingData,
        { upsert: true, new: true }
      );
    }

    const payload = savedDoc || bookingData;

    // Real-time broadcast via Socket.io
    io.to(`hospital:${bookingData.hospitalId}`).emit('admission:new', payload);
    io.emit('admission:booked', payload);

    res.status(201).json({ success: true, booking: payload });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get('/api/planned-admissions', async (req, res) => {
  try {
    if (isDbConnected()) {
      const admissions = await PlannedAdmissionModel.find().sort({ createdAt: -1 }).limit(50);
      return res.json(admissions);
    }
    res.json([]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// 7. Live Bed State Persistence (/h & /hospital routes)
app.post('/api/bed-sync', async (req, res) => {
  try {
    const bedState = req.body;
    const hospId = bedState.hospitalId || 'gsvm-kanpur';
    if (isDbConnected()) {
      await HospitalBedStateModel.findOneAndUpdate(
        { hospitalId: hospId },
        bedState,
        { upsert: true, new: true }
      );
    }

    // Real-time broadcast via Socket.io
    io.to(`hospital:${hospId}`).emit('bed:capacity_synced', bedState);
    io.emit('bed:global_sync', bedState);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get('/api/bed-status', async (req, res) => {
  try {
    if (isDbConnected()) {
      const state = await HospitalBedStateModel.findOne({ hospitalId: (req.query.hospitalId as string) || 'gsvm-kanpur' });
      if (state) return res.json(state);
    }
    res.json(null);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// 8. Stretcher & Auto-Admission Telemetry Logs
app.post('/api/telemetry-log', async (req, res) => {
  try {
    const logData = req.body;
    const hospId = logData.hospitalId || 'gsvm-kanpur';
    const logEntry = {
      logId: logData.id || `log-${Date.now()}`,
      hospitalId: hospId,
      eventType: logData.eventType || 'auto_admission',
      caseId: logData.caseId,
      description: logData.text || logData.description,
      zone: logData.zone,
      staffAssigned: logData.staffAssigned,
      bedAssigned: logData.bedAssigned,
      timestampStr: logData.time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    if (isDbConnected()) {
      await TelemetryLogModel.create(logEntry);
    }

    // Real-time broadcast via Socket.io
    io.to(`hospital:${hospId}`).emit('telemetry:new_log', logEntry);
    io.emit('telemetry:stream', logEntry);

    res.json({ success: true, log: logEntry });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// 9. Floor Bed Stepper API
app.post('/api/floor/beds', async (req, res) => {
  const { hospitalId, floorId, type, delta } = req.body;
  const hospital = hospitalsState[hospitalId];
  if (!hospital) return res.status(404).json({ error: 'Hospital not found' });

  const floor = hospital.floors.find((f) => f.floorId === floorId);
  if (!floor) return res.status(404).json({ error: 'Floor not found' });

  if (type === 'occupied') {
    floor.occupiedBeds = Math.max(0, Math.min(floor.totalBeds, floor.occupiedBeds + delta));
    floor.availableBeds = floor.totalBeds - floor.occupiedBeds;
  } else if (type === 'total') {
    floor.totalBeds = Math.max(floor.occupiedBeds, floor.totalBeds + delta);
    floor.availableBeds = floor.totalBeds - floor.occupiedBeds;
  } else if (type === 'icu_occupied') {
    floor.icuBeds.occupied = Math.max(0, Math.min(floor.icuBeds.total, floor.icuBeds.occupied + delta));
    floor.icuBeds.available = floor.icuBeds.total - floor.icuBeds.occupied;
  } else if (type === 'vent_inuse') {
    floor.ventilators.inUse = Math.max(0, Math.min(floor.ventilators.total, floor.ventilators.inUse + delta));
    floor.ventilators.available = floor.ventilators.total - floor.ventilators.inUse;
  }

  // Recalculate facility totals
  hospital.occupiedFacilityBeds = hospital.floors.reduce((acc, f) => acc + f.occupiedBeds, 0);
  hospital.totalFacilityBeds = hospital.floors.reduce((acc, f) => acc + f.totalBeds, 0);

  const payload = {
    hospitalId,
    floorId,
    floor,
    totalFacilityBeds: hospital.totalFacilityBeds,
    occupiedFacilityBeds: hospital.occupiedFacilityBeds
  };

  io.to(`hospital:${hospitalId}`).emit('floor:beds_updated', payload);
  io.emit('bed:capacity_synced', {
    hospitalId,
    totalFacilityBeds: hospital.totalFacilityBeds,
    occupiedFacilityBeds: hospital.occupiedFacilityBeds
  });
  res.json({ success: true, payload });
});

// =========================================================================
// Socket.io Real-time Event Management & Hub
// =========================================================================
io.on('connection', (socket) => {
  console.log(`[Socket.io] Terminal client connected: ${socket.id}`);

  // Send initial connected handshake
  socket.emit('system:ready', {
    socketId: socket.id,
    serverTime: new Date().toISOString(),
    dbConnected: isDbConnected(),
    hospitals: Object.keys(hospitalsState)
  });

  // Hospital-specific room subscription
  socket.on('join:hospital', ({ hospitalId }) => {
    const roomName = `hospital:${hospitalId}`;
    socket.join(roomName);
    console.log(`[Socket.io] ${socket.id} joined room ${roomName}`);
    const hospital = hospitalsState[hospitalId];
    if (hospital) {
      socket.emit('hospital:state_sync', hospital);
    }
  });

  // Regional city-wide room subscription
  socket.on('join:city', ({ cityName }) => {
    const roomName = `city:${cityName}`;
    socket.join(roomName);
    console.log(`[Socket.io] ${socket.id} joined city room ${roomName}`);
  });

  // 1. Citizen Emergency Triage Inbound Alert
  socket.on('patient:dispatch_inbound', async (dispatch: InboundDispatch) => {
    console.log(`[Socket.io] Inbound dispatch received: ${dispatch.dispatchId} -> ${dispatch.hospitalId}`);
    const hospital = hospitalsState[dispatch.hospitalId];
    if (hospital) {
      const idx = hospital.activeDispatches.findIndex((d) => d.dispatchId === dispatch.dispatchId);
      if (idx >= 0) {
        hospital.activeDispatches[idx] = dispatch;
      } else {
        hospital.activeDispatches.unshift(dispatch);
      }

      // Persist to MongoDB
      if (isDbConnected()) {
        try {
          await DispatchModel.findOneAndUpdate(
            { dispatchId: dispatch.dispatchId },
            {
              dispatchId: dispatch.dispatchId,
              hospitalId: dispatch.hospitalId,
              hospitalName: hospital.name,
              patientName: dispatch.patient?.fullName || 'Emergency Citizen',
              patientAge: dispatch.patient?.age,
              patientGender: dispatch.patient?.gender,
              severity: dispatch.severity,
              symptomCategory: dispatch.patient?.symptomCategory,
              vitals: dispatch.patient?.vitals,
              etaMinutes: dispatch.etaMinutes,
              status: dispatch.status,
              assignedBay: dispatch.assignedBay,
              assignedDoctor: dispatch.assignedDoctor,
              targetDepartment: dispatch.patient?.targetDepartment,
              clinicalPriorityNotes: dispatch.patient?.clinicalPriorityNotes,
              originCoords: dispatch.originCoords,
              currentCoords: dispatch.currentCoords
            },
            { upsert: true, new: true }
          );
        } catch {
          // ignore
        }
      }

      io.to(`hospital:${dispatch.hospitalId}`).emit('patient:inbound_received', dispatch);
      io.to(`city:${hospital.city}`).emit('city:dispatch_broadcast', {
        hospitalId: hospital.id,
        dispatch
      });
      io.emit('global:dispatch_update', dispatch);
    }
  });

  // 2. Realtime Transit Telemetry & GPS Stream
  socket.on('ambulance:telemetry_stream', (data: { dispatchId: string; hospitalId: string; coords: { lat: number; lng: number }; etaMinutes: number; vitals?: any }) => {
    io.to(`hospital:${data.hospitalId}`).emit('ambulance:telemetry_update', data);
    io.emit('transit:gps_stream', data);
  });

  // 3. Fast-Track ₹500 Token Generation Event
  socket.on('token:create', async (tokenData: any) => {
    console.log(`[Socket.io] Token create event: ${tokenData.tokenNumber}`);
    if (isDbConnected()) {
      try {
        await TokenModel.findOneAndUpdate(
          { tokenNumber: tokenData.tokenNumber },
          tokenData,
          { upsert: true, new: true }
        );
      } catch {
        // ignore
      }
    }
    const targetHosp = tokenData.hospitalId || 'gsvm-kanpur';
    io.to(`hospital:${targetHosp}`).emit('token:new', tokenData);
    io.emit('token:issued', tokenData);
  });

  // 4. Planned OPD / Bed Admission Booking Event
  socket.on('admission:book', async (bookingData: any) => {
    console.log(`[Socket.io] Admission booking event: ${bookingData.bookingId}`);
    if (isDbConnected()) {
      try {
        await PlannedAdmissionModel.findOneAndUpdate(
          { bookingId: bookingData.bookingId },
          bookingData,
          { upsert: true, new: true }
        );
      } catch {
        // ignore
      }
    }
    io.to(`hospital:${bookingData.hospitalId}`).emit('admission:new', bookingData);
    io.emit('admission:booked', bookingData);
  });

  // 5. Partner Facility Registration Event (/hb route)
  socket.on('facility:register', async (facilityData: any) => {
    console.log(`[Socket.io] Partner facility register: ${facilityData.facilityName}`);
    if (isDbConnected()) {
      try {
        await FacilityModel.findOneAndUpdate(
          { facilityId: facilityData.facilityId },
          facilityData,
          { upsert: true, new: true }
        );
      } catch {
        // ignore
      }
    }
    io.emit('facility:registered', facilityData);
    io.emit('partner:facility_added', facilityData);
  });

  // 6. Bed Stepper & Occupancy Adjustment
  socket.on('floor:update_beds', (data: { hospitalId: string; floorId: number; type: string; delta: number }) => {
    const { hospitalId, floorId, type, delta } = data;
    const hospital = hospitalsState[hospitalId];
    if (!hospital) return;

    const floor = hospital.floors.find((f) => f.floorId === floorId);
    if (!floor) return;

    if (type === 'occupied') {
      floor.occupiedBeds = Math.max(0, Math.min(floor.totalBeds, floor.occupiedBeds + delta));
      floor.availableBeds = floor.totalBeds - floor.occupiedBeds;
    } else if (type === 'total') {
      floor.totalBeds = Math.max(floor.occupiedBeds, floor.totalBeds + delta);
      floor.availableBeds = floor.totalBeds - floor.occupiedBeds;
    } else if (type === 'icu_occupied') {
      floor.icuBeds.occupied = Math.max(0, Math.min(floor.icuBeds.total, floor.icuBeds.occupied + delta));
      floor.icuBeds.available = floor.icuBeds.total - floor.icuBeds.occupied;
    } else if (type === 'vent_inuse') {
      floor.ventilators.inUse = Math.max(0, Math.min(floor.ventilators.total, floor.ventilators.inUse + delta));
      floor.ventilators.available = floor.ventilators.total - floor.ventilators.inUse;
    }

    hospital.occupiedFacilityBeds = hospital.floors.reduce((acc, f) => acc + f.occupiedBeds, 0);
    hospital.totalFacilityBeds = hospital.floors.reduce((acc, f) => acc + f.totalBeds, 0);

    const payload = {
      hospitalId,
      floorId,
      floor,
      totalFacilityBeds: hospital.totalFacilityBeds,
      occupiedFacilityBeds: hospital.occupiedFacilityBeds
    };
    io.to(`hospital:${hospitalId}`).emit('floor:beds_updated', payload);
    io.emit('bed:capacity_synced', {
      hospitalId,
      totalFacilityBeds: hospital.totalFacilityBeds,
      occupiedFacilityBeds: hospital.occupiedFacilityBeds
    });
  });

  // 7. Stretcher & Telemetry Logs Event
  socket.on('telemetry:log', async (logData: any) => {
    const hospId = logData.hospitalId || 'gsvm-kanpur';
    const logEntry = {
      logId: logData.id || `log-${Date.now()}`,
      hospitalId: hospId,
      eventType: logData.eventType || 'auto_admission',
      caseId: logData.caseId,
      description: logData.text || logData.description,
      zone: logData.zone,
      staffAssigned: logData.staffAssigned,
      bedAssigned: logData.bedAssigned,
      timestampStr: logData.time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    if (isDbConnected()) {
      try {
        await TelemetryLogModel.create(logEntry);
      } catch {
        // ignore
      }
    }

    io.to(`hospital:${hospId}`).emit('telemetry:new_log', logEntry);
    io.emit('telemetry:stream', logEntry);
  });

  // 8. Pharmacy stock updates
  socket.on('pharmacy:update_status', (data: { hospitalId: string; itemId: string; newStockLevel: number }) => {
    const { hospitalId, itemId, newStockLevel } = data;
    const hospital = hospitalsState[hospitalId];
    if (!hospital) return;

    const item = hospital.pharmacy.items.find((i) => i.id === itemId);
    if (item) {
      item.stockLevel = Math.max(0, newStockLevel);
      if (item.stockLevel === 0) {
        item.status = 'Critical Stock';
      } else if (item.stockLevel <= item.minThreshold) {
        item.status = 'Low';
      } else {
        item.status = 'Adequate';
      }
      item.lastUpdated = 'Just now';
      io.to(`hospital:${hospitalId}`).emit('pharmacy:stock_updated', {
        hospitalId,
        pharmacy: hospital.pharmacy
      });
    }
  });

  // 9. Patient triage status progression
  socket.on(
    'patient:update_status',
    async (data: { hospitalId: string; dispatchId: string; status: string; assignedBay?: string; assignedDoctor?: string }) => {
      const { hospitalId, dispatchId, status, assignedBay, assignedDoctor } = data;
      const hospital = hospitalsState[hospitalId];
      if (!hospital) return;

      const dispatch = hospital.activeDispatches.find((d) => d.dispatchId === dispatchId);
      if (dispatch) {
        dispatch.status = status as any;
        if (assignedBay) dispatch.assignedBay = assignedBay;
        if (assignedDoctor) dispatch.assignedDoctor = assignedDoctor;
        dispatch.updatedTimestamp = new Date().toISOString();

        if (isDbConnected()) {
          try {
            await DispatchModel.findOneAndUpdate(
              { dispatchId },
              { status, assignedBay, assignedDoctor, updatedAt: new Date() },
              { upsert: true, new: true }
            );
          } catch {
            // ignore
          }
        }

        io.to(`hospital:${hospitalId}`).emit('patient:status_updated', dispatch);
        io.emit('global:dispatch_update', dispatch);
      }
    }
  );

  // 10. Doctor roster status toggle
  socket.on(
    'doctor:update_status',
    (data: { hospitalId: string; floorId: number; doctorId: string; status: 'Present' | 'In OT' | 'On Rounds' | 'Off Duty' }) => {
      const { hospitalId, floorId, doctorId, status } = data;
      const hospital = hospitalsState[hospitalId];
      if (!hospital) return;

      const floor = hospital.floors.find((f) => f.floorId === floorId);
      if (!floor) return;

      const doc = floor.doctors.find((d) => d.id === doctorId);
      if (doc) {
        doc.status = status;
        io.to(`hospital:${hospitalId}`).emit('doctor:status_updated', {
          hospitalId,
          floorId,
          doctorId,
          status,
          floor
        });
      }
    }
  );

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

// Vite & Static Handling
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Prathmikta Critical Care Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
