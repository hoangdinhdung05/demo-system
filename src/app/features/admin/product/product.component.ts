import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ProductService } from 'src/app/core/services/products/product.service';
import { CategoryService } from 'src/app/core/services/categories/category.service';
import { environment } from 'src/environments/environment';

declare var bootstrap: any;

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {

  products: any[] = [];
  filteredProducts: any[] = [];
  totalPages = 0;
  totalElements = 0;
  currentPage = 0;
  pageSize = 5;
  loading = false;

  @ViewChild('createProductModal') createProductModal!: ElementRef;
  @ViewChild('editProductModal') editProductModal!: ElementRef;
  @ViewChild('detailsProductModal') detailsProductModal!: ElementRef;

  createProductForm!: FormGroup;
  editProductForm!: FormGroup;
  modalInstance: any;
  editModalInstance: any;
  detailsModalInstance: any;
  selectedProduct: any = null;
  selectedProductDetails: any = null;

  searchText = '';
  imageFile?: File;
  imagePreview?: string; // Thêm để preview ảnh
  categoryOptions: any[] = [];

  constructor(
    private productService: ProductService, 
    private toastr: ToastrService, 
    private fb: FormBuilder
    , private categoryService: CategoryService
  ) { }

  imageUrl(product: any) {
    return `${environment.assetBase}${product.productImageUrl}`;
  }

  ngOnInit(): void {
    this.createProductForm = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      categoryId: [null],
      quantity: [0, [Validators.required, Validators.min(0)]]
    });

    this.editProductForm = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      categoryId: [null],
      quantity: [0, [Validators.required, Validators.min(0)]]
    });

    this.loadProducts(this.currentPage);
    this.loadCategoryOptions();
  }

  loadCategoryOptions() {
    // load many categories (page 0, large pageSize) to fill select options
    this.categoryService.getAllCategories(0, 1000).subscribe({
      next: (res) => {
        if (res.success) {
          this.categoryOptions = res.data.content || [];
        }
      },
      error: (err) => {
        console.error('Error loading category options', err);
      }
    });
  }

  loadProducts(page: number) {
    this.loading = true;
    this.productService.getAllProducts(page, this.pageSize).subscribe({
      next: (response) => {
        if (response.success) {
          this.products = response.data.content;
          this.totalPages = response.data.totalPages;
          this.totalElements = response.data.totalElements;
          this.currentPage = response.data.pageNumber;
          this.filteredProducts = this.products;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading products', err);
        this.toastr.error('Không thể tải danh sách sản phẩm!', 'Lỗi');
        this.loading = false;
      }
    });
  }

  nextPage() { 
    if (this.currentPage < this.totalPages - 1) this.loadProducts(this.currentPage + 1); 
  }
  
  previousPage() { 
    if (this.currentPage > 0) this.loadProducts(this.currentPage - 1); 
  }
  
  goToPage(page: number) { 
    this.loadProducts(page); 
  }

  filterProducts() {
    const text = this.searchText.toLowerCase();
    this.filteredProducts = this.products.filter(p =>
      p.name?.toLowerCase().includes(text) ||
      (p.description?.toLowerCase().includes(text))
    );
  }

  exportProductReport() {
    this.loading = true;
    this.productService.exportProductReport().subscribe({
      next: (blob) => {
        const file = new Blob([blob], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        window.open(fileURL, '_blank');
        this.toastr.success('Xuất báo cáo PDF thành công!', 'Thành công');
        this.loading = false;
      },
      error: (err) => {
        console.error('Export report error:', err);
        this.toastr.error('Không thể xuất báo cáo PDF!', 'Lỗi');
        this.loading = false;
      }
    });
  }

  // === CREATE PRODUCT ===
  openCreateModal() {
    this.modalInstance = new bootstrap.Modal(this.createProductModal.nativeElement);
    this.createProductForm.reset({ price: 0 });
    this.imageFile = undefined;
    this.imagePreview = undefined;
    this.modalInstance.show();
  }

  closeCreateModal() {
    if (this.modalInstance) this.modalInstance.hide();
  }

  onImageSelected(event: any) {
    const file: File = event.target.files?.[0];
    if (!file) { this.imageFile = undefined; this.imagePreview = undefined; return; }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      this.toastr.error('Chỉ chấp nhận file ảnh (JPG, PNG, WEBP)!', 'Lỗi');
      event.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.toastr.error('Kích thước file không được vượt quá 5MB!', 'Lỗi');
      event.target.value = '';
      return;
    }

    this.imageFile = file;

    const reader = new FileReader();
    reader.onload = (e: any) => this.imagePreview = e.target.result;
    reader.readAsDataURL(file);
  }


  submitCreateProduct() {
    if (this.createProductForm.invalid) {
      this.toastr.warning('Vui lòng điền đầy đủ thông tin!', 'Cảnh báo');
      return;
    }

    const v = this.createProductForm.value;
    const formData = new FormData();

    formData.append('name', (v.name ?? '').trim());
    formData.append('description', v.description ?? '');
    formData.append('price', String(v.price ?? 0));
    formData.append('quantity', String(v.quantity ?? 0));               // ✅ không để null
    if (v.categoryId != null) formData.append('categoryId', String(v.categoryId));
    if (this.imageFile)       formData.append('imageFile', this.imageFile); // ✅ đúng key

    this.loading = true;
    this.productService.createProduct(formData).subscribe({
      next: res => {
        if (res.success) {
          this.toastr.success('Tạo sản phẩm thành công!', 'Thành công');
          this.closeCreateModal();
          this.loadProducts(this.currentPage);
        } else {
          this.toastr.warning(res.message || 'Không thể tạo sản phẩm!', 'Cảnh báo');
        }
        this.loading = false;
      },
      error: err => {
        console.error('Create product error:', err);
        this.toastr.error(err.error?.message || 'Có lỗi xảy ra khi tạo sản phẩm!', 'Lỗi');
        this.loading = false;
      }
    });
  }


  // === EDIT PRODUCT ===
  openEditModal(product: any) {
    this.selectedProduct = product;
    this.editProductForm.patchValue({
      name: product.name,
      description: product.description,
      price: product.price,
      categoryId: product.categoryId
    });

    this.editModalInstance = new bootstrap.Modal(this.editProductModal.nativeElement);
    this.editModalInstance.show();
  }

  closeEditModal() {
    if (this.editModalInstance) this.editModalInstance.hide();
  }

  submitEditProduct() {
    if (this.editProductForm.invalid || !this.selectedProduct) return;

    const request = this.editProductForm.value;
    this.productService.updateProduct(this.selectedProduct.id, request).subscribe({
      next: res => {
        this.toastr.success('Cập nhật sản phẩm thành công!', 'Thành công');
        this.closeEditModal();
        this.loadProducts(this.currentPage);
      },
      error: err => {
        console.error('Update error:', err);
        this.toastr.error(err.error?.message || 'Có lỗi xảy ra khi cập nhật!', 'Lỗi');
      }
    });
  }

  // === DELETE PRODUCT ===
  deleteProduct(product: any) {
    if (!confirm(`Bạn có chắc muốn xóa sản phẩm "${product.name}" không?`)) return;

    this.productService.deleteProduct(product.id).subscribe({
      next: res => {
        if (res.success) {
          this.toastr.success('Xóa sản phẩm thành công!', 'Thành công');
          this.loadProducts(
            this.currentPage > 0 && this.filteredProducts.length === 1
              ? this.currentPage - 1
              : this.currentPage
          );
        } else {
          this.toastr.warning('Không thể xóa sản phẩm này!', 'Cảnh báo');
        }
      },
      error: err => {
        console.error('Error deleting product:', err);
        this.toastr.error(err.error?.message || 'Có lỗi xảy ra!', 'Lỗi');
      }
    });
  }

  // === DETAILS PRODUCT ===
  openDetailsModal(productId: number) {
    this.productService.getProductDetails(productId).subscribe({
      next: res => {
        if (res.success) {
          this.selectedProductDetails = res.data;
          this.detailsModalInstance = new bootstrap.Modal(this.detailsProductModal.nativeElement);
          this.detailsModalInstance.show();
        } else {
          this.toastr.warning('Không tìm thấy thông tin sản phẩm', 'Cảnh báo');
        }
      },
      error: err => {
        console.error('Lỗi khi lấy chi tiết product:', err);
        this.toastr.error('Không thể tải thông tin chi tiết!', 'Lỗi');
      }
    });
  }

  closeDetailsModal() {
    if (this.detailsModalInstance) this.detailsModalInstance.hide();
  }

}