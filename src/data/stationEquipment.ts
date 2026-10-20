import { StationEquipmentRecord } from '../types';

// Customer-requested grouped pump register (not live telemetry).
// Size units are retained exactly as supplied pending engineering confirmation.
export const INITIAL_STATION_EQUIPMENT: StationEquipmentRecord[] = [
  { id:'spec-group-01', category:'pump', nameAr:'مضخة عمودية', sizeLabel:'800 m²', quantity:2, dischargeM3S:2, condition:'غير محددة' },
  { id:'spec-group-02', category:'pump', nameAr:'مضخة عمودية', sizeLabel:'600 m²', quantity:4, dischargeM3S:1, condition:'غير محددة' },
  { id:'spec-group-03', category:'pump', nameAr:'مضخة عمودية', sizeLabel:'500 m²', quantity:2, dischargeM3S:0.5, condition:'غير محددة' },
  { id:'spec-group-04', category:'pump', nameAr:'مضخة ديزل مترية', sizeLabel:'500 m²', quantity:2, dischargeM3S:0.5, condition:'غير محددة' },
  { id:'spec-group-05', category:'pump', nameAr:'مضخة ديزل نصف مترية', sizeLabel:'500 m²', quantity:1, dischargeM3S:0.5, condition:'غير محددة' },
  { id:'spec-group-06', category:'pump', nameAr:'مضخة غطاس', sizeLabel:'16 inch', quantity:3, dischargeM3S:0.400, condition:'غير محددة' },
  { id:'spec-group-07', category:'pump', nameAr:'مضخة غطاس', sizeLabel:'10 inch', quantity:1, dischargeM3S:0.240, condition:'غير محددة' },
  { id:'spec-g01', category:'generator', nameAr:'مولد 1', manufacturer:'Cummins', capacityKva:1300, condition:'غير محددة' },
  { id:'spec-g02', category:'generator', nameAr:'مولد 2', manufacturer:'MTU', serialNumber:'2318', capacityKva:1000, condition:'غير محددة' },
  { id:'spec-g03', category:'generator', nameAr:'مولد 3', manufacturer:'IVECO', serialNumber:'1034', capacityKva:450, condition:'غير محددة' },
  { id:'spec-g04', category:'generator', nameAr:'مولد 4', manufacturer:'CATERPILAR', serialNumber:'274/6127', capacityKva:591, condition:'غير محددة' },
  { id:'spec-g05', category:'generator', nameAr:'مولد 5', manufacturer:'Cummins', capacityKva:1375, condition:'غير محددة' },
];
