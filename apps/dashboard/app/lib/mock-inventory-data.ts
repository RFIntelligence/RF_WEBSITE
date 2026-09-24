export type InventoryStatus = 'HEALTHY' | 'LOW' | 'OUT' | 'OVERSTOCKED' | 'EXPIRING';

export type MovementType = 'RECEIPT' | 'SHIPMENT' | 'TRANSFER' | 'ADJUSTMENT' | 'RETURN';

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  unitPrice: number;
  unit: string;
  reorderPoint: number;
  targetStock: number;
  expiryDate?: string | null;
  description?: string;
}

export interface InventoryLocation {
  id: string;
  name: string;
  code: string;
  address: string;
  isPrimary?: boolean;
}

export interface StockLevel {
  id: string;
  itemId: string;
  locationId: string;
  onHand: number;
  reserved: number;
  available: number;
  updatedAt: string;
}

export interface InventoryMovement {
  id: string;
  itemId: string;
  locationId: string;
  type: MovementType;
  quantity: number;
  reference: string;
  timestamp: string;
  performedBy: string;
  notes?: string;
}

export interface InventoryDataResponse {
  items: InventoryItem[];
  locations: InventoryLocation[];
  stockLevels: StockLevel[];
  movements: InventoryMovement[];
}

// ─── Suppliers & Purchase Orders Interfaces ───────────────────────────────────

export interface Supplier {
  id: string;
  name: string;
  code: string;
  contactName: string;
  email: string;
  phone: string;
  category: string;
  onTimeDeliveryRate: number; // percentage e.g. 98.6
  averageLeadTimeDays: number;
  rating: number; // e.g. 4.9 out of 5
  address: string;
}

export type POStatus = 'DRAFT' | 'SENT' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED';

export interface PurchaseOrderItem {
  itemId: string;
  quantity: number;
  unitPrice: number;
  receivedQuantity: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  targetLocationId: string;
  status: POStatus;
  createdAt: string;
  sentAt?: string | null;
  expectedDeliveryDate: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  notes?: string;
  createdByType: 'AI_AGENT' | 'HUMAN';
  createdByName: string;
}

// ─── Initial Mock Locations ───────────────────────────────────────────────────

export const MOCK_LOCATIONS: InventoryLocation[] = [
  {
    id: "loc_austin",
    name: "Main HQ Warehouse",
    code: "AUS-01",
    address: "Austin, TX (Primary Hub)",
    isPrimary: true,
  },
  {
    id: "loc_nj",
    name: "East Coast Logistics Center",
    code: "E-NJ-02",
    address: "Secaucus, NJ",
  },
  {
    id: "loc_ca",
    name: "West Coast Tech Hub",
    code: "W-CA-01",
    address: "San Jose, CA",
  },
];

// ─── Initial Mock Items ───────────────────────────────────────────────────────

export const MOCK_ITEMS: InventoryItem[] = [
  {
    id: "item_01",
    sku: "RF-ANT-58G-01",
    name: "5.8GHz Omnidirectional Antenna 12dBi",
    category: "Antennas",
    unitPrice: 249.99,
    unit: "units",
    reorderPoint: 25,
    targetStock: 100,
    expiryDate: null,
    description: "High-gain weatherized omni antenna for long-range ISM band deployment.",
  },
  {
    id: "item_02",
    sku: "RF-TRX-SDR-V3",
    name: "SDR Dual-Channel Transceiver Board v3",
    category: "Transceivers",
    unitPrice: 1250.00,
    unit: "units",
    reorderPoint: 10,
    targetStock: 40,
    expiryDate: null,
    description: "Wideband SDR frontend module supporting 70MHz to 6GHz RF spectrum.",
  },
  {
    id: "item_03",
    sku: "RF-AMP-PA50W",
    name: "50W GaN High-Power RF Amplifier Module",
    category: "Amplifiers",
    unitPrice: 890.50,
    unit: "units",
    reorderPoint: 8,
    targetStock: 30,
    expiryDate: null,
    description: "Solid-state linear power amplifier module for L/S band uplink transmission.",
  },
  {
    id: "item_04",
    sku: "RF-CBL-RG316-100M",
    name: "RG-316 Coaxial Cable Spool (100m)",
    category: "Cables & Interconnects",
    unitPrice: 145.00,
    unit: "spools",
    reorderPoint: 15,
    targetStock: 40,
    expiryDate: null,
    description: "Flexible PTFE high-temperature 50-ohm coaxial cable spool.",
  },
  {
    id: "item_05",
    sku: "RF-CAL-GAS-CELL",
    name: "Rubidium Vapor Atomic Frequency Standard Cell",
    category: "Testing & Calibration",
    unitPrice: 3450.00,
    unit: "units",
    reorderPoint: 5,
    targetStock: 15,
    expiryDate: new Date(Date.now() + 25 * 86400 * 1000).toISOString(), // Expires in 25 days
    description: "Precision gas cell atomic clock reference module requiring periodic calibration.",
  },
  {
    id: "item_06",
    sku: "RF-SEAL-THRM-GEL",
    name: "Thermal Conductive Gel (RF Heatsink Grade)",
    category: "Testing & Calibration",
    unitPrice: 85.00,
    unit: "syringes",
    reorderPoint: 20,
    targetStock: 60,
    expiryDate: new Date(Date.now() + 12 * 86400 * 1000).toISOString(), // Expires in 12 days
    description: "High thermal conductivity paste for power amplifier junction cooling.",
  },
  {
    id: "item_07",
    sku: "RF-DPX-KU-HP",
    name: "Ku-Band High-Power Waveguide Diplexer",
    category: "Amplifiers",
    unitPrice: 2150.00,
    unit: "units",
    reorderPoint: 6,
    targetStock: 20,
    expiryDate: null,
    description: "Dual-cavity waveguide filter for satellite ground terminal isolation.",
  },
  {
    id: "item_08",
    sku: "RF-LNA-ULN-02",
    name: "Ultra-Low Noise Preamp 0.5-4GHz",
    category: "Amplifiers",
    unitPrice: 420.00,
    unit: "units",
    reorderPoint: 12,
    targetStock: 35,
    expiryDate: null,
    description: "Noise figure <0.8dB low noise preamplifier with integrated ESD protection.",
  },
  {
    id: "item_09",
    sku: "RF-CON-LBD-DC",
    name: "L-Band Downconverter Unit (950-2150MHz)",
    category: "Transceivers",
    unitPrice: 675.00,
    unit: "units",
    reorderPoint: 15,
    targetStock: 50,
    expiryDate: null,
    description: "Low-phase-noise block downconverter with internal 10MHz OCXO.",
  },
  {
    id: "item_10",
    sku: "RF-TOOL-SMA-TQ",
    name: "Precision SMA Torque Wrench Kit 8in-lb",
    category: "Testing & Calibration",
    unitPrice: 195.00,
    unit: "kits",
    reorderPoint: 10,
    targetStock: 30,
    expiryDate: null,
    description: "Calibrated 5/16 inch break-over torque wrench for SMA connectors.",
  },
  {
    id: "item_11",
    sku: "RF-ATT-30DB-100W",
    name: "30dB 100W Fixed Coaxial Attenuator DC-18GHz",
    category: "Testing & Calibration",
    unitPrice: 310.00,
    unit: "units",
    reorderPoint: 14,
    targetStock: 45,
    expiryDate: null,
    description: "High-power dummy load attenuator with aluminum heatsink fins.",
  },
  {
    id: "item_12",
    sku: "RF-PROT-10KW-SG",
    name: "10kW Heavy-Duty Lightning Surge Protector N-F",
    category: "Cables & Interconnects",
    unitPrice: 165.00,
    unit: "units",
    reorderPoint: 18,
    targetStock: 50,
    expiryDate: null,
    description: "Gas tube DC pass surge suppressor for tower-mounted antennas.",
  },
  {
    id: "item_13",
    sku: "RF-CON-NTYP-GLD",
    name: "Gold-Plated N-Type Male Crimpmount 50-Ohm",
    category: "Cables & Interconnects",
    unitPrice: 12.50,
    unit: "packs",
    reorderPoint: 100,
    targetStock: 300,
    expiryDate: null,
    description: "Precision milled brass body connectors for LMR-400 cable assembly.",
  },
  {
    id: "item_14",
    sku: "RF-FERR-CHOKE-PK",
    name: "Ferrite Noise Suppressor Core Choke (Pack of 20)",
    category: "Cables & Interconnects",
    unitPrice: 28.00,
    unit: "packs",
    reorderPoint: 50,
    targetStock: 150,
    expiryDate: null,
    description: "Snap-on ferrite beads for RFI mitigation on power & ribbon cables.",
  },
  {
    id: "item_15",
    sku: "RF-SW-PIN-HIGH",
    name: "High-Isolation PIN Diode SP4T Switch",
    category: "Transceivers",
    unitPrice: 540.00,
    unit: "units",
    reorderPoint: 12,
    targetStock: 40,
    expiryDate: null,
    description: "Fast-switching solid state RF switch with TTL control inputs.",
  },
  {
    id: "item_16",
    sku: "RF-TERM-50OHM-25W",
    name: "50-Ohm 25W Precision RF Termination Load",
    category: "Testing & Calibration",
    unitPrice: 98.00,
    unit: "units",
    reorderPoint: 20,
    targetStock: 60,
    expiryDate: null,
    description: "Low-VSWR dummy load for transmitter tuning and antenna testing.",
  },
  {
    id: "item_17",
    sku: "RF-PS-DIGI-6BIT",
    name: "6-Bit Digital Phase Shifter 2.0-4.0GHz",
    category: "Transceivers",
    unitPrice: 780.00,
    unit: "units",
    reorderPoint: 8,
    targetStock: 30,
    expiryDate: null,
    description: "Phased array beamforming module with 5.625-degree resolution.",
  },
  {
    id: "item_18",
    sku: "RF-WAV-WR90-ADP",
    name: "WR-90 Waveguide to Coax Adapter X-Band",
    category: "Cables & Interconnects",
    unitPrice: 385.00,
    unit: "units",
    reorderPoint: 10,
    targetStock: 35,
    expiryDate: null,
    description: "Right-angle WR-90 waveguide flange to SMA female launcher adapter.",
  },
];

// ─── Initial Stock Levels Array (linked by itemId & locationId) ──────────────

export const MOCK_STOCK_LEVELS: StockLevel[] = [
  // item_01 (Healthy) total onHand: 68 (RP: 25, Target: 100)
  { id: "sl_01_aus", itemId: "item_01", locationId: "loc_austin", onHand: 42, reserved: 5, available: 37, updatedAt: "2026-09-24T14:30:00Z" },
  { id: "sl_01_nj",  itemId: "item_01", locationId: "loc_nj",     onHand: 18, reserved: 2, available: 16, updatedAt: "2026-09-23T11:00:00Z" },
  { id: "sl_01_ca",  itemId: "item_01", locationId: "loc_ca",     onHand: 8,  reserved: 0, available: 8,  updatedAt: "2026-09-22T09:15:00Z" },

  // item_02 (Healthy) total onHand: 32 (RP: 10, Target: 40)
  { id: "sl_02_aus", itemId: "item_02", locationId: "loc_austin", onHand: 18, reserved: 3, available: 15, updatedAt: "2026-09-24T10:00:00Z" },
  { id: "sl_02_nj",  itemId: "item_02", locationId: "loc_nj",     onHand: 9,  reserved: 1, available: 8,  updatedAt: "2026-09-21T16:20:00Z" },
  { id: "sl_02_ca",  itemId: "item_02", locationId: "loc_ca",     onHand: 5,  reserved: 0, available: 5,  updatedAt: "2026-09-20T12:00:00Z" },

  // item_03 (Healthy) total onHand: 24 (RP: 8, Target: 30)
  { id: "sl_03_aus", itemId: "item_03", locationId: "loc_austin", onHand: 14, reserved: 2, available: 12, updatedAt: "2026-09-24T08:45:00Z" },
  { id: "sl_03_nj",  itemId: "item_03", locationId: "loc_nj",     onHand: 6,  reserved: 0, available: 6,  updatedAt: "2026-09-19T14:00:00Z" },
  { id: "sl_03_ca",  itemId: "item_03", locationId: "loc_ca",     onHand: 4,  reserved: 1, available: 3,  updatedAt: "2026-09-18T10:30:00Z" },

  // item_04 (Overstocked) total onHand: 78 (RP: 15, Target: 40)
  { id: "sl_04_aus", itemId: "item_04", locationId: "loc_austin", onHand: 45, reserved: 4, available: 41, updatedAt: "2026-09-24T15:10:00Z" },
  { id: "sl_04_nj",  itemId: "item_04", locationId: "loc_nj",     onHand: 22, reserved: 2, available: 20, updatedAt: "2026-09-22T13:40:00Z" },
  { id: "sl_04_ca",  itemId: "item_04", locationId: "loc_ca",     onHand: 11, reserved: 0, available: 11, updatedAt: "2026-09-20T08:00:00Z" },

  // item_05 (Expiring) total onHand: 11 (RP: 5, Target: 15)
  { id: "sl_05_aus", itemId: "item_05", locationId: "loc_austin", onHand: 6, reserved: 1, available: 5, updatedAt: "2026-09-24T09:20:00Z" },
  { id: "sl_05_nj",  itemId: "item_05", locationId: "loc_nj",     onHand: 3, reserved: 0, available: 3, updatedAt: "2026-09-23T15:00:00Z" },
  { id: "sl_05_ca",  itemId: "item_05", locationId: "loc_ca",     onHand: 2, reserved: 0, available: 2, updatedAt: "2026-09-22T11:30:00Z" },

  // item_06 (Expiring) total onHand: 38 (RP: 20, Target: 60)
  { id: "sl_06_aus", itemId: "item_06", locationId: "loc_austin", onHand: 24, reserved: 4, available: 20, updatedAt: "2026-09-24T12:00:00Z" },
  { id: "sl_06_nj",  itemId: "item_06", locationId: "loc_nj",     onHand: 10, reserved: 1, available: 9,  updatedAt: "2026-09-21T10:00:00Z" },
  { id: "sl_06_ca",  itemId: "item_06", locationId: "loc_ca",     onHand: 4,  reserved: 0, available: 4,  updatedAt: "2026-09-19T17:20:00Z" },

  // item_07 (Out) total onHand: 0 (RP: 6, Target: 20)
  { id: "sl_07_aus", itemId: "item_07", locationId: "loc_austin", onHand: 0, reserved: 0, available: 0, updatedAt: "2026-09-24T07:00:00Z" },
  { id: "sl_07_nj",  itemId: "item_07", locationId: "loc_nj",     onHand: 0, reserved: 0, available: 0, updatedAt: "2026-09-23T08:00:00Z" },
  { id: "sl_07_ca",  itemId: "item_07", locationId: "loc_ca",     onHand: 0, reserved: 0, available: 0, updatedAt: "2026-09-22T14:00:00Z" },

  // item_08 (Out) total onHand: 0 (RP: 12, Target: 35)
  { id: "sl_08_aus", itemId: "item_08", locationId: "loc_austin", onHand: 0, reserved: 0, available: 0, updatedAt: "2026-09-24T11:00:00Z" },
  { id: "sl_08_nj",  itemId: "item_08", locationId: "loc_nj",     onHand: 0, reserved: 0, available: 0, updatedAt: "2026-09-23T12:00:00Z" },
  { id: "sl_08_ca",  itemId: "item_08", locationId: "loc_ca",     onHand: 0, reserved: 0, available: 0, updatedAt: "2026-09-20T09:00:00Z" },

  // item_09 (Low) total onHand: 9 (RP: 15, Target: 50)
  { id: "sl_09_aus", itemId: "item_09", locationId: "loc_austin", onHand: 5, reserved: 1, available: 4, updatedAt: "2026-09-24T13:15:00Z" },
  { id: "sl_09_nj",  itemId: "item_09", locationId: "loc_nj",     onHand: 3, reserved: 1, available: 2, updatedAt: "2026-09-22T16:00:00Z" },
  { id: "sl_09_ca",  itemId: "item_09", locationId: "loc_ca",     onHand: 1, reserved: 0, available: 1, updatedAt: "2026-09-21T10:45:00Z" },

  // item_10 (Low) total onHand: 6 (RP: 10, Target: 30)
  { id: "sl_10_aus", itemId: "item_10", locationId: "loc_austin", onHand: 4, reserved: 1, available: 3, updatedAt: "2026-09-24T14:00:00Z" },
  { id: "sl_10_nj",  itemId: "item_10", locationId: "loc_nj",     onHand: 2, reserved: 0, available: 2, updatedAt: "2026-09-23T10:00:00Z" },
  { id: "sl_10_ca",  itemId: "item_10", locationId: "loc_ca",     onHand: 0, reserved: 0, available: 0, updatedAt: "2026-09-22T08:30:00Z" },

  // item_11 (Low) total onHand: 11 (RP: 14, Target: 45)
  { id: "sl_11_aus", itemId: "item_11", locationId: "loc_austin", onHand: 7, reserved: 2, available: 5, updatedAt: "2026-09-24T09:00:00Z" },
  { id: "sl_11_nj",  itemId: "item_11", locationId: "loc_nj",     onHand: 3, reserved: 0, available: 3, updatedAt: "2026-09-22T14:20:00Z" },
  { id: "sl_11_ca",  itemId: "item_11", locationId: "loc_ca",     onHand: 1, reserved: 0, available: 1, updatedAt: "2026-09-20T11:00:00Z" },

  // item_12 (Low) total onHand: 12 (RP: 18, Target: 50)
  { id: "sl_12_aus", itemId: "item_12", locationId: "loc_austin", onHand: 8, reserved: 2, available: 6, updatedAt: "2026-09-24T16:00:00Z" },
  { id: "sl_12_nj",  itemId: "item_12", locationId: "loc_nj",     onHand: 3, reserved: 0, available: 3, updatedAt: "2026-09-23T13:00:00Z" },
  { id: "sl_12_ca",  itemId: "item_12", locationId: "loc_ca",     onHand: 1, reserved: 0, available: 1, updatedAt: "2026-09-21T15:30:00Z" },

  // item_13 (Overstocked) total onHand: 480 (RP: 100, Target: 300)
  { id: "sl_13_aus", itemId: "item_13", locationId: "loc_austin", onHand: 280, reserved: 20, available: 260, updatedAt: "2026-09-24T10:30:00Z" },
  { id: "sl_13_nj",  itemId: "item_13", locationId: "loc_nj",     onHand: 120, reserved: 10, available: 110, updatedAt: "2026-09-23T14:00:00Z" },
  { id: "sl_13_ca",  itemId: "item_13", locationId: "loc_ca",     onHand: 80,  reserved: 5,  available: 75,  updatedAt: "2026-09-22T11:15:00Z" },

  // item_14 (Overstocked / Dead stock candidate) total onHand: 260 (RP: 50, Target: 150)
  { id: "sl_14_aus", itemId: "item_14", locationId: "loc_austin", onHand: 160, reserved: 0, available: 160, updatedAt: "2026-09-24T11:30:00Z" },
  { id: "sl_14_nj",  itemId: "item_14", locationId: "loc_nj",     onHand: 70,  reserved: 0, available: 70,  updatedAt: "2026-09-21T09:00:00Z" },
  { id: "sl_14_ca",  itemId: "item_14", locationId: "loc_ca",     onHand: 30,  reserved: 0, available: 30,  updatedAt: "2026-09-18T16:00:00Z" },

  // item_15 (Healthy) total onHand: 28 (RP: 12, Target: 40)
  { id: "sl_15_aus", itemId: "item_15", locationId: "loc_austin", onHand: 16, reserved: 2, available: 14, updatedAt: "2026-09-24T15:00:00Z" },
  { id: "sl_15_nj",  itemId: "item_15", locationId: "loc_nj",     onHand: 8,  reserved: 1, available: 7,  updatedAt: "2026-09-22T12:00:00Z" },
  { id: "sl_15_ca",  itemId: "item_15", locationId: "loc_ca",     onHand: 4,  reserved: 0, available: 4,  updatedAt: "2026-09-20T14:30:00Z" },

  // item_16 (Healthy) total onHand: 45 (RP: 20, Target: 60)
  { id: "sl_16_aus", itemId: "item_16", locationId: "loc_austin", onHand: 25, reserved: 3, available: 22, updatedAt: "2026-09-24T08:00:00Z" },
  { id: "sl_16_nj",  itemId: "item_16", locationId: "loc_nj",     onHand: 12, reserved: 1, available: 11, updatedAt: "2026-09-23T09:30:00Z" },
  { id: "sl_16_ca",  itemId: "item_16", locationId: "loc_ca",     onHand: 8,  reserved: 0, available: 8,  updatedAt: "2026-09-21T11:00:00Z" },

  // item_17 (Healthy) total onHand: 22 (RP: 8, Target: 30)
  { id: "sl_17_aus", itemId: "item_17", locationId: "loc_austin", onHand: 13, reserved: 2, available: 11, updatedAt: "2026-09-24T13:40:00Z" },
  { id: "sl_17_nj",  itemId: "item_17", locationId: "loc_nj",     onHand: 6,  reserved: 1, available: 5,  updatedAt: "2026-09-22T10:15:00Z" },
  { id: "sl_17_ca",  itemId: "item_17", locationId: "loc_ca",     onHand: 3,  reserved: 0, available: 3,  updatedAt: "2026-09-19T15:00:00Z" },

  // item_18 (Healthy) total onHand: 25 (RP: 10, Target: 35)
  { id: "sl_18_aus", itemId: "item_18", locationId: "loc_austin", onHand: 14, reserved: 1, available: 13, updatedAt: "2026-09-24T11:15:00Z" },
  { id: "sl_18_nj",  itemId: "item_18", locationId: "loc_nj",     onHand: 7,  reserved: 0, available: 7,  updatedAt: "2026-09-23T14:45:00Z" },
  { id: "sl_18_ca",  itemId: "item_18", locationId: "loc_ca",     onHand: 4,  reserved: 0, available: 4,  updatedAt: "2026-09-21T08:30:00Z" },
];

// ─── Initial Movements Array ──────────────────────────────────────────────────

export const MOCK_MOVEMENTS: InventoryMovement[] = [
  {
    id: "mov_101",
    itemId: "item_01",
    locationId: "loc_austin",
    type: "RECEIPT",
    quantity: 20,
    reference: "PO-2026-8812",
    timestamp: "2026-09-24T14:30:00Z",
    performedBy: "Alex Rivera",
    notes: "Batch receipt from Amphenol RF factory.",
  },
  {
    id: "mov_102",
    itemId: "item_01",
    locationId: "loc_nj",
    type: "TRANSFER",
    quantity: -10,
    reference: "TR-4401",
    timestamp: "2026-09-23T11:00:00Z",
    performedBy: "Sarah Chen",
    notes: "Inter-facility transfer to East Hub.",
  },
  {
    id: "mov_103",
    itemId: "item_02",
    locationId: "loc_austin",
    type: "SHIPMENT",
    quantity: -4,
    reference: "SO-9921",
    timestamp: "2026-09-24T10:00:00Z",
    performedBy: "Marcus Vance",
    notes: "Dispatched to Lockheed Radar Systems project.",
  },
  {
    id: "mov_104",
    itemId: "item_03",
    locationId: "loc_austin",
    type: "RECEIPT",
    quantity: 10,
    reference: "PO-2026-8800",
    timestamp: "2026-09-24T08:45:00Z",
    performedBy: "Alex Rivera",
    notes: "GaN power module restocking.",
  },
  {
    id: "mov_105",
    itemId: "item_09",
    locationId: "loc_austin",
    type: "SHIPMENT",
    quantity: -8,
    reference: "SO-9850",
    timestamp: "2026-09-23T16:00:00Z",
    performedBy: "Elena Rostova",
    notes: "Full order fulfillment for SATCOM Ground Array.",
  },
  {
    id: "mov_106",
    itemId: "item_07",
    locationId: "loc_austin",
    type: "SHIPMENT",
    quantity: -6,
    reference: "SO-9812",
    timestamp: "2026-09-22T14:00:00Z",
    performedBy: "Marcus Vance",
    notes: "Depleted remaining stock for defense client deployment.",
  },
  {
    id: "mov_107",
    itemId: "item_05",
    locationId: "loc_austin",
    type: "ADJUSTMENT",
    quantity: -1,
    reference: "AUD-009",
    timestamp: "2026-09-24T09:20:00Z",
    performedBy: "Sarah Chen",
    notes: "Expired cell removed during ISO-9001 quality check.",
  },
  {
    id: "mov_108",
    itemId: "item_13",
    locationId: "loc_austin",
    type: "RECEIPT",
    quantity: 150,
    reference: "PO-2026-8740",
    timestamp: "2026-09-20T10:30:00Z",
    performedBy: "Alex Rivera",
    notes: "Bulk connector shipment received.",
  },
  {
    id: "mov_109",
    itemId: "item_06",
    locationId: "loc_austin",
    type: "RECEIPT",
    quantity: 30,
    reference: "PO-2026-8799",
    timestamp: "2026-09-22T12:00:00Z",
    performedBy: "Sarah Chen",
    notes: "Thermal gel lot #441A delivered.",
  },
  {
    id: "mov_110",
    itemId: "item_10",
    locationId: "loc_nj",
    type: "SHIPMENT",
    quantity: -5,
    reference: "SO-9799",
    timestamp: "2026-09-21T10:00:00Z",
    performedBy: "Elena Rostova",
    notes: "Sent to field technicians in North region.",
  },
];

// ─── Helper Functions ─────────────────────────────────────────────────────────

/**
 * Calculates total on hand stock across all locations for an item.
 */
export function getTotalOnHand(itemId: string, stockLevels: StockLevel[]): number {
  return stockLevels
    .filter((sl) => sl.itemId === itemId)
    .reduce((sum, sl) => sum + sl.onHand, 0);
}

/**
 * Calculates total stock value across all locations for an item.
 */
export function getItemTotalValue(item: InventoryItem, stockLevels: StockLevel[]): number {
  const totalQty = getTotalOnHand(item.id, stockLevels);
  return totalQty * item.unitPrice;
}

/**
 * Determines an item's status pill category based on stock levels and expiry dates.
 */
export function getItemStatus(item: InventoryItem, stockLevels: StockLevel[]): InventoryStatus {
  const total = getTotalOnHand(item.id, stockLevels);

  // Check expiring condition first (expiry within 60 days)
  if (item.expiryDate) {
    const timeDiff = new Date(item.expiryDate).getTime() - Date.now();
    if (timeDiff > 0 && timeDiff <= 60 * 86400 * 1000) {
      return "EXPIRING";
    }
  }

  if (total === 0) {
    return "OUT";
  }

  if (total <= item.reorderPoint) {
    return "LOW";
  }

  if (total > item.targetStock * 1.25) {
    return "OVERSTOCKED";
  }

  return "HEALTHY";
}

/**
 * Generates plausible 90-day daily stock history points for the sparkline chart.
 */
export function get90DaySparklineData(item: InventoryItem, currentOnHand: number) {
  const points: { date: string; onHand: number; reorderPoint: number }[] = [];
  const days = 90;
  
  // Deterministic seed simulation backwards from today
  let simulatedStock = currentOnHand;

  for (let i = days; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    // Slight variance simulation: small drops (shipments) and occasional spikes (receipts)
    if (i !== 0) {
      const charCode = item.sku.charCodeAt(i % item.sku.length);
      const isSpike = (i % 22 === 0);
      const isDrop = (i % 5 === 0);

      if (isSpike) {
        simulatedStock = Math.max(0, simulatedStock - Math.round((item.targetStock * 0.4) + (charCode % 5)));
      } else if (isDrop) {
        simulatedStock = Math.min(item.targetStock * 1.4, simulatedStock + (charCode % 4) + 1);
      }
    } else {
      simulatedStock = currentOnHand;
    }

    points.push({
      date: dateStr,
      onHand: Math.max(0, Math.round(simulatedStock)),
      reorderPoint: item.reorderPoint,
    });
  }

  return points;
}

// ─── Initial Mock Suppliers ───────────────────────────────────────────────────

export const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: "sup_amphenol",
    name: "Amphenol RF Systems Corp",
    code: "SUP-AMP-01",
    contactName: "David Vance",
    email: "dvance@amphenol-rf.com",
    phone: "+1 (800) 627-7100",
    category: "Antennas & Cables",
    onTimeDeliveryRate: 98.6,
    averageLeadTimeDays: 4,
    rating: 4.9,
    address: "Danbury, CT",
  },
  {
    id: "sup_analog",
    name: "Analog Devices Component Hub",
    code: "SUP-ADI-02",
    contactName: "Clara Wright",
    email: "clara.wright@analog.com",
    phone: "+1 (800) 262-5643",
    category: "Transceivers & Semiconductors",
    onTimeDeliveryRate: 96.2,
    averageLeadTimeDays: 8,
    rating: 4.8,
    address: "Wilmington, MA",
  },
  {
    id: "sup_minicircuits",
    name: "Mini-Circuits International",
    code: "SUP-MNC-03",
    contactName: "Jonathan Miller",
    email: "jmiller@minicircuits.com",
    phone: "+1 (718) 934-4500",
    category: "Amplifiers & Switches",
    onTimeDeliveryRate: 99.1,
    averageLeadTimeDays: 3,
    rating: 5.0,
    address: "Brooklyn, NY",
  },
  {
    id: "sup_keysight",
    name: "Keysight Calibrations & Test",
    code: "SUP-KEY-04",
    contactName: "Samantha Reed",
    email: "samantha.reed@keysight.com",
    phone: "+1 (800) 829-4444",
    category: "Testing & Standards",
    onTimeDeliveryRate: 94.0,
    averageLeadTimeDays: 12,
    rating: 4.6,
    address: "Santa Rosa, CA",
  },
  {
    id: "sup_l3harris",
    name: "L3Harris Defense Subsystems",
    code: "SUP-L3H-05",
    contactName: "Robert Hughes",
    email: "robert.hughes@l3harris.com",
    phone: "+1 (3 Melbourne) 727-9100",
    category: "Waveguides & Diplexers",
    onTimeDeliveryRate: 91.5,
    averageLeadTimeDays: 14,
    rating: 4.4,
    address: "Melbourne, FL",
  },
];

// ─── Initial Mock Purchase Orders ─────────────────────────────────────────────

export const MOCK_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: "po_101",
    poNumber: "PO-2026-9011",
    supplierId: "sup_amphenol",
    targetLocationId: "loc_austin",
    status: "DRAFT",
    createdAt: "2026-09-24T18:10:00Z",
    expectedDeliveryDate: "2026-10-02T00:00:00Z",
    items: [
      { itemId: "item_01", quantity: 50, unitPrice: 249.99, receivedQuantity: 0 },
      { itemId: "item_04", quantity: 10, unitPrice: 145.00, receivedQuantity: 0 },
    ],
    totalAmount: 13949.50,
    notes: "Auto-generated AI reorder draft based on low stock threshold trigger on item RF-ANT-58G-01.",
    createdByType: "AI_AGENT",
    createdByName: "RF Intelligence Agent",
  },
  {
    id: "po_102",
    poNumber: "PO-2026-9012",
    supplierId: "sup_minicircuits",
    targetLocationId: "loc_austin",
    status: "DRAFT",
    createdAt: "2026-09-24T16:35:00Z",
    expectedDeliveryDate: "2026-09-29T00:00:00Z",
    items: [
      { itemId: "item_08", quantity: 20, unitPrice: 420.00, receivedQuantity: 0 },
      { itemId: "item_15", quantity: 15, unitPrice: 540.00, receivedQuantity: 0 },
    ],
    totalAmount: 16500.00,
    notes: "AI recommended restocking PO for depleted low noise preamps.",
    createdByType: "AI_AGENT",
    createdByName: "RF Intelligence Agent",
  },
  {
    id: "po_103",
    poNumber: "PO-2026-8990",
    supplierId: "sup_analog",
    targetLocationId: "loc_austin",
    status: "SENT",
    createdAt: "2026-09-23T11:20:00Z",
    sentAt: "2026-09-23T14:00:00Z",
    expectedDeliveryDate: "2026-09-28T00:00:00Z",
    items: [
      { itemId: "item_02", quantity: 15, unitPrice: 1250.00, receivedQuantity: 0 },
      { itemId: "item_09", quantity: 25, unitPrice: 675.00, receivedQuantity: 0 },
    ],
    totalAmount: 35625.00,
    notes: "Approved by Alex Rivera for Lockheed Radar Systems project phase II.",
    createdByType: "HUMAN",
    createdByName: "Alex Rivera",
  },
  {
    id: "po_104",
    poNumber: "PO-2026-8985",
    supplierId: "sup_l3harris",
    targetLocationId: "loc_nj",
    status: "SENT",
    createdAt: "2026-09-22T09:00:00Z",
    sentAt: "2026-09-22T10:15:00Z",
    expectedDeliveryDate: "2026-10-05T00:00:00Z",
    items: [
      { itemId: "item_07", quantity: 8, unitPrice: 2150.00, receivedQuantity: 0 },
    ],
    totalAmount: 17200.00,
    notes: "Waveguide diplexers for East Hub satellite project.",
    createdByType: "HUMAN",
    createdByName: "Sarah Chen",
  },
  {
    id: "po_105",
    poNumber: "PO-2026-8920",
    supplierId: "sup_keysight",
    targetLocationId: "loc_austin",
    status: "PARTIALLY_RECEIVED",
    createdAt: "2026-09-18T14:00:00Z",
    sentAt: "2026-09-18T15:30:00Z",
    expectedDeliveryDate: "2026-09-25T00:00:00Z",
    items: [
      { itemId: "item_10", quantity: 10, unitPrice: 195.00, receivedQuantity: 6 },
      { itemId: "item_11", quantity: 30, unitPrice: 310.00, receivedQuantity: 20 },
    ],
    totalAmount: 11250.00,
    notes: "First partial shipment received on Sep 22. Awaiting remaining 4 wrench kits & 10 attenuators.",
    createdByType: "HUMAN",
    createdByName: "Marcus Vance",
  },
  {
    id: "po_106",
    poNumber: "PO-2026-8812",
    supplierId: "sup_amphenol",
    targetLocationId: "loc_austin",
    status: "RECEIVED",
    createdAt: "2026-09-10T08:00:00Z",
    sentAt: "2026-09-10T09:30:00Z",
    expectedDeliveryDate: "2026-09-15T00:00:00Z",
    items: [
      { itemId: "item_01", quantity: 20, unitPrice: 249.99, receivedQuantity: 20 },
    ],
    totalAmount: 4999.80,
    notes: "Fully delivered and checked into Austin inventory.",
    createdByType: "HUMAN",
    createdByName: "Alex Rivera",
  },
  {
    id: "po_107",
    poNumber: "PO-2026-8700",
    supplierId: "sup_l3harris",
    targetLocationId: "loc_ca",
    status: "CANCELLED",
    createdAt: "2026-09-05T10:00:00Z",
    expectedDeliveryDate: "2026-09-19T00:00:00Z",
    items: [
      { itemId: "item_07", quantity: 2, unitPrice: 2150.00, receivedQuantity: 0 },
    ],
    totalAmount: 4300.00,
    notes: "Cancelled due to duplicated procurement order.",
    createdByType: "HUMAN",
    createdByName: "Sarah Chen",
  },
];

