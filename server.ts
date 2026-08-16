import express from 'express';
import http from 'http';
import path from 'path';
import { Server as SocketIOServer } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import { INITIAL_HOSPITALS } from './src/lib/initialData';
import { HospitalFacility, InboundDispatch } from './src/types';

const app = express();
const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = 3000;

app.use(express.json());

// Authoritative in-memory state
const hospitalsState: Record<string, HospitalFacility> = JSON.parse(JSON.stringify(INITIAL_HOSPITALS));

// REST API Endpoints
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'Prathmikta Emergency Core',
    activeHospitals: Object.keys(hospitalsState).length,
    timestamp: new Date().toISOString()
  });
});

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

app.post('/api/dispatch', (req, res) => {
  const dispatchPayload: InboundDispatch = req.body;
  const hospital = hospitalsState[dispatchPayload.hospitalId];
  if (!hospital) {
    return res.status(404).json({ error: 'Target hospital facility not found' });
  }

  // Idempotent insertion
  const existingIdx = hospital.activeDispatches.findIndex(d => d.dispatchId === dispatchPayload.dispatchId);
  if (existingIdx >= 0) {
    hospital.activeDispatches[existingIdx] = dispatchPayload;
  } else {
    hospital.activeDispatches.unshift(dispatchPayload);
  }

  // Broadcast to rooms
  io.to(`hospital:${dispatchPayload.hospitalId}`).emit('patient:inbound_received', dispatchPayload);
  io.to(`city:${hospital.city}`).emit('city:dispatch_broadcast', {
    hospitalId: hospital.id,
    dispatch: dispatchPayload
  });

  res.status(201).json({ success: true, dispatch: dispatchPayload });
});

app.post('/api/floor/beds', (req, res) => {
  const { hospitalId, floorId, type, delta } = req.body;
  const hospital = hospitalsState[hospitalId];
  if (!hospital) return res.status(404).json({ error: 'Hospital not found' });

  const floor = hospital.floors.find(f => f.floorId === floorId);
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

  const payload = { hospitalId, floorId, floor, totalFacilityBeds: hospital.totalFacilityBeds, occupiedFacilityBeds: hospital.occupiedFacilityBeds };
  io.to(`hospital:${hospitalId}`).emit('floor:beds_updated', payload);
  res.json({ success: true, payload });
});

// Socket.io Real-time Event Management
io.on('connection', (socket) => {
  console.log(`[Socket] Terminal connected: ${socket.id}`);

  // Hospital-specific room subscription
  socket.on('join:hospital', ({ hospitalId }) => {
    socket.join(`hospital:${hospitalId}`);
    console.log(`[Socket] ${socket.id} joined hospital:${hospitalId}`);
    const hospital = hospitalsState[hospitalId];
    if (hospital) {
      socket.emit('hospital:state_sync', hospital);
    }
  });

  // Regional city-wide subscription
  socket.on('join:city', ({ cityName }) => {
    socket.join(`city:${cityName}`);
    console.log(`[Socket] ${socket.id} joined city:${cityName}`);
  });

  // Citizen dispatches inbound emergency alert
  socket.on('patient:dispatch_inbound', (dispatch: InboundDispatch) => {
    const hospital = hospitalsState[dispatch.hospitalId];
    if (hospital) {
      const idx = hospital.activeDispatches.findIndex(d => d.dispatchId === dispatch.dispatchId);
      if (idx >= 0) {
        hospital.activeDispatches[idx] = dispatch;
      } else {
        hospital.activeDispatches.unshift(dispatch);
      }
      console.log(`[Socket] Inbound dispatch ${dispatch.dispatchId} -> ${dispatch.hospitalId} [${dispatch.severity}]`);
      io.to(`hospital:${dispatch.hospitalId}`).emit('patient:inbound_received', dispatch);
      io.to(`city:${hospital.city}`).emit('city:dispatch_broadcast', {
        hospitalId: hospital.id,
        dispatch
      });
    }
  });

  // Bed adjustments from ER Wall Command steppers
  socket.on('floor:update_beds', (data: { hospitalId: string; floorId: number; type: string; delta: number }) => {
    const { hospitalId, floorId, type, delta } = data;
    const hospital = hospitalsState[hospitalId];
    if (!hospital) return;

    const floor = hospital.floors.find(f => f.floorId === floorId);
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
  });

  // Pharmacy stock updates
  socket.on('pharmacy:update_status', (data: { hospitalId: string; itemId: string; newStockLevel: number }) => {
    const { hospitalId, itemId, newStockLevel } = data;
    const hospital = hospitalsState[hospitalId];
    if (!hospital) return;

    const item = hospital.pharmacy.items.find(i => i.id === itemId);
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

  // Patient triage status progression (e.g. In Transit -> Bay Ready -> Cath Lab Prepped -> Arrived)
  socket.on('patient:update_status', (data: { hospitalId: string; dispatchId: string; status: string; assignedBay?: string; assignedDoctor?: string }) => {
    const { hospitalId, dispatchId, status, assignedBay, assignedDoctor } = data;
    const hospital = hospitalsState[hospitalId];
    if (!hospital) return;

    const dispatch = hospital.activeDispatches.find(d => d.dispatchId === dispatchId);
    if (dispatch) {
      dispatch.status = status as any;
      if (assignedBay) dispatch.assignedBay = assignedBay;
      if (assignedDoctor) dispatch.assignedDoctor = assignedDoctor;
      dispatch.updatedTimestamp = new Date().toISOString();

      io.to(`hospital:${hospitalId}`).emit('patient:status_updated', dispatch);
    }
  });

  // Doctor roster status toggle
  socket.on('doctor:update_status', (data: { hospitalId: string; floorId: number; doctorId: string; status: 'Present' | 'In OT' | 'On Rounds' | 'Off Duty' }) => {
    const { hospitalId, floorId, doctorId, status } = data;
    const hospital = hospitalsState[hospitalId];
    if (!hospital) return;

    const floor = hospital.floors.find(f => f.floorId === floorId);
    if (!floor) return;

    const doc = floor.doctors.find(d => d.id === doctorId);
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
  });

  socket.on('disconnect', () => {
    // disconnected
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
