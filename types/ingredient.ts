// Record nhập hàng - lưu trong history.import
export interface ImportRecord {
  id: string; // Auto-generated ID
  amount: number; // Khối lượng nhập (ví dụ: 10kg, 5l)
  quantity: number; // Số lượng đơn vị định lượng nhập (ví dụ: 10 hộp, 5 thùng)
  unit: string; // Đơn vị tính
  price: number; // Giá nhập
  importDate: string; // Ngày giờ nhập hàng (ISO string)
  note?: string;
  createdAt: string;
}

// Record kiểm kê - lưu trong history.inventory
export interface InventoryRecord {
  id: string; // Auto-generated ID
  amount: number; // Khối lượng còn lại sau kiểm kê (ví dụ: 10kg, 5l)
  quantity: number; // Số lượng đơn vị định lượng còn lại (ví dụ: 10 hộp, 5 thùng)
  inventoryDate: string; // Ngày giờ kiểm kê (ISO string)
  note?: string;
  createdAt: string;
}

// Base ingredient interface - chỉ chứa thông tin cơ bản
export interface Ingredient {
  id: string;
  name: string;
  supplier: string; // Bắt buộc
  amount: number; // Khối lượng của nguyên liệu (ví dụ: 10kg, 5l)
  quantity: number; // Số lượng đơn vị định lượng (ví dụ: 10 hộp, 5 thùng)
  unit: string; // Đơn vị tính
  note?: string;
  history?: {
    import: ImportRecord[]; // Lịch sử nhập hàng
    inventory: InventoryRecord[]; // Lịch sử kiểm kê
  };
  createdAt: string;
  updatedAt: string;
}

// Extended ingredient với thông tin tính toán từ records
export interface IngredientWithStats extends Ingredient {
  currentQuantity: number; // Số lượng hiện tại (tính từ records)
  lastImportDate?: string; // Ngày nhập hàng gần nhất
  lastInventoryDate?: string; // Ngày kiểm kê gần nhất
  averagePrice?: number; // Giá trung bình từ các lần nhập
  isLowStock: boolean; // Có sắp hết không (< 20% so với tổng số lượng đã nhập)
  totalImportedQuantity?: number; // Tổng số lượng đã nhập (từ tất cả import records)
}
