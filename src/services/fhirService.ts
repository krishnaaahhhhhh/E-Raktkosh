import { PatientData, ClinicalData, FHIRBundle, FHIRResource } from '../types/transfer';

export class FHIRService {
  /**
   * Generates a FHIR R4 Document Bundle conforming to ABDM Emergency Care Profile
   * Encounter ID: PRK-2026-0818-00427
   */
  public static generateEDossierFHIRBundle(
    patient: PatientData,
    clinical: ClinicalData,
    encounterId: string
  ): FHIRBundle {
    const timestamp = new Date().toISOString();

    const patientResource: FHIRResource = {
      resourceType: 'Patient',
      id: `pat-${patient.id}`,
      meta: {
        versionId: '1',
        lastUpdated: timestamp,
        profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/Patient'],
      },
      identifier: [
        {
          type: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v2-0203', code: 'MR' }] },
          system: 'https://healthid.ndhm.gov.in',
          value: patient.abhaId,
        },
        {
          system: 'https://prathmikta.gov.in/encounters',
          value: encounterId,
        },
      ],
      name: [{ use: 'official', text: patient.name }],
      telecom: [{ system: 'phone', value: patient.contactNumber, use: 'mobile' }],
      gender: patient.gender === 'M' ? 'male' : patient.gender === 'F' ? 'female' : 'other',
      birthDate: '1972-04-12',
      address: [
        {
          line: ['Civil Lines, Ward 12'],
          city: 'Kanpur',
          state: 'Uttar Pradesh',
          postalCode: '208001',
          country: 'IND',
        },
      ],
    };

    const encounterResource: FHIRResource = {
      resourceType: 'Encounter',
      id: `enc-${encounterId}`,
      meta: {
        versionId: '1',
        lastUpdated: timestamp,
        profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/Encounter'],
      },
      identifier: [{ system: 'https://prathmikta.gov.in/encounters', value: encounterId }],
      status: 'in-progress',
      class: {
        system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
        code: 'EMER',
        display: 'Emergency Transfer',
      },
      subject: { reference: `Patient/pat-${patient.id}`, display: patient.name },
      serviceProvider: { display: patient.currentHospital },
      participant: [
        {
          individual: { display: patient.attendingDoctor },
        },
      ],
      period: {
        start: '2026-08-18T18:04:00+05:30',
      },
      reasonCode: [
        {
          coding: [
            {
              system: 'http://snomed.info/sct',
              code: '401303003',
              display: 'Acute ST-segment elevation myocardial infarction (STEMI)',
            },
          ],
        },
      ],
    };

    const conditionResource: FHIRResource = {
      resourceType: 'Condition',
      id: `cond-stemi-01`,
      meta: {
        versionId: '1',
        lastUpdated: timestamp,
        profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/Condition'],
      },
      clinicalStatus: {
        coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: 'active' }],
      },
      verificationStatus: {
        coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status', code: 'confirmed' }],
      },
      category: [
        {
          coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-category', code: 'encounter-diagnosis' }],
        },
      ],
      severity: {
        coding: [{ system: 'http://snomed.info/sct', code: '24484000', display: 'Severe / Critical' }],
      },
      code: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '401303003',
            display: 'Acute ST elevation myocardial infarction of anteroseptal wall',
          },
          {
            system: 'http://hl7.org/fhir/sid/icd-10',
            code: clinical.icd10Code,
            display: 'ST elevation (STEMI) myocardial infarction of anterior wall',
          },
        ],
        text: clinical.diagnosis,
      },
      subject: { reference: `Patient/pat-${patient.id}`, display: patient.name },
      encounter: { reference: `Encounter/enc-${encounterId}` },
      onsetDateTime: '2026-08-18T17:30:00+05:30',
      recordedDate: '2026-08-18T18:23:00+05:30',
    };

    const vitalsObservationResource: FHIRResource = {
      resourceType: 'Observation',
      id: `obs-vitals-01`,
      meta: {
        versionId: '1',
        lastUpdated: timestamp,
        profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/Observation'],
      },
      status: 'final',
      category: [
        {
          coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'vital-signs' }],
        },
      ],
      code: {
        coding: [{ system: 'http://loinc.org', code: '85353-1', display: 'Vital signs, weight, height, head circumference and body mass index panel' }],
        text: 'Emergency Vital Signs Panel',
      },
      subject: { reference: `Patient/pat-${patient.id}`, display: patient.name },
      effectiveDateTime: '2026-08-18T18:35:00+05:30',
      component: [
        {
          code: { coding: [{ system: 'http://loinc.org', code: '8867-4', display: 'Heart rate' }] },
          valueQuantity: { value: clinical.vitals.heartRate, unit: 'beats/minute', system: 'http://unitsofmeasure.org', code: '/min' },
        },
        {
          code: { coding: [{ system: 'http://loinc.org', code: '2708-6', display: 'Oxygen saturation in Arterial blood' }] },
          valueQuantity: { value: clinical.vitals.spO2, unit: '%', system: 'http://unitsofmeasure.org', code: '%' },
        },
        {
          code: { coding: [{ system: 'http://loinc.org', code: '8480-6', display: 'Systolic blood pressure' }] },
          valueQuantity: { value: 132, unit: 'mm[Hg]', system: 'http://unitsofmeasure.org', code: 'mm[Hg]' },
        },
        {
          code: { coding: [{ system: 'http://loinc.org', code: '8462-4', display: 'Diastolic blood pressure' }] },
          valueQuantity: { value: 86, unit: 'mm[Hg]', system: 'http://unitsofmeasure.org', code: 'mm[Hg]' },
        },
        {
          code: { coding: [{ system: 'http://loinc.org', code: '9279-1', display: 'Respiratory rate' }] },
          valueQuantity: { value: clinical.vitals.respiratoryRate, unit: 'breaths/minute', system: 'http://unitsofmeasure.org', code: '/min' },
        },
      ],
    };

    const ecgDiagnosticReport: FHIRResource = {
      resourceType: 'DiagnosticReport',
      id: `diag-ecg-01`,
      meta: {
        versionId: '1',
        lastUpdated: timestamp,
        profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/DiagnosticReport'],
      },
      status: 'final',
      category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v2-0074', code: 'CG', display: 'Cardiology' }] }],
      code: {
        coding: [{ system: 'http://loinc.org', code: '11524-6', display: '12-lead ECG report' }],
        text: '12-Lead Emergency Electrocardiogram',
      },
      subject: { reference: `Patient/pat-${patient.id}`, display: patient.name },
      effectiveDateTime: '2026-08-18T18:17:00+05:30',
      conclusion: 'Acute ST-segment elevation in leads V1-V4 (2.5mm - 3.8mm), reciprocal ST depression in II, III, aVF. Hyperacute T-waves.',
    };

    const medicationResources: FHIRResource[] = clinical.medications.map((med, index) => ({
      resourceType: 'MedicationAdministration',
      id: `med-admin-0${index + 1}`,
      meta: {
        versionId: '1',
        lastUpdated: timestamp,
        profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/MedicationAdministration'],
      },
      status: 'completed',
      medicationCodeableConcept: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: '387458008',
            display: med.drugName,
          },
        ],
        text: `${med.drugName} ${med.dose} (${med.category})`,
      },
      subject: { reference: `Patient/pat-${patient.id}`, display: patient.name },
      effectiveDateTime: `2026-08-18T${med.timeAdministered}:00+05:30`,
      dosage: {
        text: `${med.dose} via ${med.route}`,
        route: { text: med.route },
      },
      performer: [
        {
          actor: { display: med.administeredBy },
        },
      ],
    }));

    return {
      resourceType: 'Bundle',
      id: `bundle-prathmikta-${encounterId}`,
      type: 'document',
      timestamp,
      identifier: {
        system: 'https://prathmikta.abdm.gov.in/e-dossier',
        value: `EDOS-${encounterId}`,
      },
      entry: [
        { fullUrl: `urn:uuid:Patient/pat-${patient.id}`, resource: patientResource },
        { fullUrl: `urn:uuid:Encounter/enc-${encounterId}`, resource: encounterResource },
        { fullUrl: `urn:uuid:Condition/cond-stemi-01`, resource: conditionResource },
        { fullUrl: `urn:uuid:Observation/obs-vitals-01`, resource: vitalsObservationResource },
        { fullUrl: `urn:uuid:DiagnosticReport/diag-ecg-01`, resource: ecgDiagnosticReport },
        ...medicationResources.map((m) => ({ fullUrl: `urn:uuid:MedicationAdministration/${m.id}`, resource: m })),
      ],
    };
  }
}
