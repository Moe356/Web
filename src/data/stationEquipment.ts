import { StationEquipmentRecord } from '../types';

// Customer-provided station specification sheet. These are technical/reference values,
// NOT live telemetry. Confirm equipment IDs, model numbers, and pump pairing on site.
export const INITIAL_STATION_EQUIPMENT: StationEquipmentRecord[] = [
  { id:'spec-p01', category:'pump', nameAr:'مضخة عمودية 1', motorKw:450, dischargeM3S:2, diameterMm:800, quantity:1, condition:'جيدة' },
  { id:'spec-p02', category:'pump', nameAr:'مضخة عمودية 2', motorKw:315, dischargeM3S:2, diameterMm:800, quantity:1, condition:'جيدة' },
  { id:'spec-p03', category:'pump', nameAr:'مضخة عمودية 3', motorKw:250, dischargeM3S:2, diameterMm:600, quantity:1, condition:'جيدة' },
  { id:'spec-p04', category:'pump', nameAr:'مضخة عمودية 4', motorKw:185, dischargeM3S:2, diameterMm:600, quantity:1, condition:'جيدة' },
  { id:'spec-p05', category:'pump', nameAr:'مضخة عمودية 5', motorKw:132, dischargeM3S:0.5, diameterMm:500, quantity:1, condition:'جيدة' },
  { id:'spec-p06', category:'pump', nameAr:'مضخة عمودية 6', motorKw:90, dischargeM3S:0.5, diameterMm:500, quantity:1, condition:'جيدة' },
  { id:'spec-p07', category:'pump', nameAr:'مضخة نصف غاطسة كهربائية', dischargeM3S:0.5, diameterMm:500, quantity:1, condition:'جيدة' },
  { id:'spec-p08', category:'pump', nameAr:'مضخة ديزل', dischargeM3S:1, diameterMm:500, quantity:2, condition:'جيدة' },
  { id:'spec-p09', category:'pump', nameAr:'مضخة غاطسة', motorKw:160, dischargeM3S:0.800, quantity:1, condition:'جيدة', notes:'بيانات إضافية للمضخات الغاطسة في الوثيقة تحتاج مطابقة ميدانية' },
  { id:'spec-p10', category:'pump', nameAr:'مضخة غاطسة', motorKw:132, dischargeM3S:0.389, quantity:1, condition:'جيدة' },
  { id:'spec-p11', category:'pump', nameAr:'مضخة غاطسة', motorKw:37, dischargeM3S:0.241, quantity:1, condition:'جيدة' },
  { id:'spec-g01', category:'generator', nameAr:'مولد 1', manufacturer:'Cummins', capacityKva:1300, condition:'صالحة' },
  { id:'spec-g02', category:'generator', nameAr:'مولد 2', manufacturer:'MTU', serialNumber:'2318', capacityKva:1000, condition:'صالحة' },
  { id:'spec-g03', category:'generator', nameAr:'مولد 3', manufacturer:'IVECO', serialNumber:'1034', capacityKva:450, condition:'صالحة' },
  { id:'spec-g04', category:'generator', nameAr:'مولد 4', manufacturer:'CATERPILAR', serialNumber:'274/6127', capacityKva:591, condition:'صالحة' },
  { id:'spec-g05', category:'generator', nameAr:'مولد 5', manufacturer:'Cummins', capacityKva:1375, condition:'صالحة' },
];
