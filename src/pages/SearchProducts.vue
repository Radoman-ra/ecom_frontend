<template>
  <div>
    <div>
      <div class="header">
        <div class="auth-buttons">
          <HomeButtons />
        </div>
      </div>

      <div class="marketplace-container">
        <div class="filters">
          <form class="search-form">
            <h2>Search Filters</h2>
            <input
              v-model="productName"
              class="input-field"
              placeholder="Product Name"
              @input="debounceSearchProducts"
            />
            <input
              v-model="creationDateFrom"
              class="input-field"
              placeholder="Creation Date From"
              type="date"
              @input="debounceSearchProducts"
            />
            <input
              v-model="creationDateTo"
              class="input-field"
              placeholder="Creation Date To"
              type="date"
              @input="debounceSearchProducts"
            />
            <input
              v-model="categoryName"
              class="input-field"
              placeholder="Category Name"
              @input="debounceSearchProducts"
            />
            <input
              v-model="supplierName"
              class="input-field"
              placeholder="Supplier Name"
              @input="debounceSearchProducts"
            />
            <input
              v-model="minPrice"
              class="input-field"
              placeholder="Min Price"
              type="number"
              @input="debounceSearchProducts"
            />
            <input
              v-model="maxPrice"
              class="input-field"
              placeholder="Max Price"
              type="number"
              @input="debounceSearchProducts"
            />
          </form>
        </div>

        <div class="products">
          <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

          <div v-if="products.length && !errorMessage" class="product-grid">
            <div
              v-for="product in products"
              :key="product.id"
              class="product-card"
              @click="openModal(product)"
            >
              <div class="image-container">
                <img
                  :class="{ blurred: loading }"
                  :src="loading ? product.lowQltyImgUrl : product.imageUrl"
                  alt="Product Image"
                  class="product-image"
                  @load="loading = false"
                />
                <span v-if="getCartQuantity(product.id) > 0" class="cart-tag">In Cart</span>
                <span v-if="product.availableQuantity === 0" class="outofstock-tag"
                  >Out of stock</span
                >
              </div>

              <h3 class="product-name">{{ product.name }}</h3>
              <p class="product-price">${{ product.price }}</p>
            </div>
          </div>

          <div v-if="products.length && !errorMessage && totalPages > 1" class="pagination">
            <select
              id="limit"
              v-model.number="limit"
              class="input-field"
              @change="debounceSearchProducts"
            >
              <option :value="5">5</option>
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="30">30</option>
              <option :value="50">50</option>
            </select>
            <div class="nav-btn-prev">
              <button
                :disabled="currentPage === 1"
                class="pagination-btn first"
                @click="goToPage(1)"
              >
                First
              </button>
              <button :disabled="currentPage === 1" class="pagination-btn prev" @click="prevPage">
                &#8592;
              </button>
            </div>
            <div class="nav-page">
              <label class="pagination-label">{{ currentPage }} / {{ totalPages }}</label>
            </div>
            <div class="nav-btn-next">
              <button
                :disabled="currentPage === totalPages"
                class="pagination-btn next"
                @click="nextPage"
              >
                &rarr;
              </button>
              <button
                :disabled="currentPage === totalPages"
                class="pagination-btn last"
                @click="goToPage(totalPages)"
              >
                Last
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="showModal"
        aria-modal="true"
        class="modal"
        role="dialog"
        tabindex="-1"
        @click="closeModal"
      >
        <div class="modal-content" @click.stop>
          <span aria-label="Close modal" class="close" role="button" @click="closeModal"
            >&times;</span
          >
          <div class="modal-main">
            <img
              :class="{ blurred: loading }"
              :src="loading ? selectedProduct.lowQltyImgUrl : selectedProduct.imageUrl"
              alt="Product Image"
              class="modal-product-image"
              @load="loading = false"
            />
            <div class="modal-info">
              <h2 class="modal-title">{{ selectedProduct.name }}</h2>
              <p class="modal-price">${{ selectedProduct.price }}</p>
              <p>
                <strong v-if="selectedProduct.availableQuantity > 0" class="modal-qty"
                  >In Stock: {{ selectedProduct.availableQuantity }}</strong
                >
                <strong v-else class="modal-outofstock">Out of Stock</strong>
              </p>
              <div class="modal-description">
                <label class="modal-description-label">Description:</label>
                <p>{{ selectedProduct.description }}</p>
              </div>
              <div class="cart-section">
                <button
                  v-if="!(selectedProduct.availableQuantity == 0)"
                  class="btn add-cart-btn"
                  @click="addToCart(selectedProduct)"
                >
                  <div>Add to Cart</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue'
import axios from 'axios'
import HomeButtons from './HomeButtons.vue'

const apiUrl = import.meta.env.VITE_BACKEND_URL
console.log({ apiUrl })

function debounce<T extends (...args: any[]) => any>(func: T, wait: number) {
  let timeout: ReturnType<typeof setTimeout> | undefined

  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}

export default defineComponent({
  components: {
    HomeButtons
  },
  data() {
    return {
      loading: true,
      productName: '',
      creationDateFrom: '',
      creationDateTo: '',
      categoryName: '',
      supplierName: '',
      minPrice: '',
      maxPrice: '',
      products: [] as Array<{
        id: number
        name: string
        price: number
        availableQuantity: number
        lowQltyImgUrl: string
        imageUrl: string
        description: string
      }>,
      currentPage: 1,
      totalPages: 0,
      limit: 10,
      errorMessage: '',
      showModal: false,
      selectedProduct: {} as {
        id: number
        name: string
        price: number
        availableQuantity: number
        description: string
        imageUrl: string
        lowQltyImgUrl: string
      },
      cart: reactive(JSON.parse(localStorage.getItem('cart') || '[]'))
    }
  },

  methods: {
    async searchProducts() {
      this.errorMessage = ''
      const params: any = {
        limit: this.limit,
        offset: (this.currentPage - 1) * this.limit
      }

      if (this.productName) params.product_name = this.productName
      if (this.creationDateFrom) params.creation_date_from = this.creationDateFrom
      if (this.creationDateTo) params.creation_date_to = this.creationDateTo
      if (this.categoryName) params.category_name = this.categoryName
      if (this.supplierName) params.supplier_name = this.supplierName
      if (this.minPrice) params.min_price = this.minPrice
      if (this.maxPrice) params.max_price = this.maxPrice

      try {
        const response = await axios.get(`${apiUrl}/api/search/products`, { params })

        this.products = response.data.products.map(
          (product: {
            id: number
            name: string
            price: number
            quantity: number
            description: string
            photo_path?: string
          }) => ({
            ...product,
            availableQuantity: product.quantity,
            lowQltyImgUrl: `${apiUrl}/static/images/10x10/${product.photo_path}`,
            imageUrl: `${apiUrl}/static/images/500x500/${product.photo_path}`,
            description: product.description
          })
        )
        this.totalPages = response.data.total_pages
        if (!this.products.length) {
          this.errorMessage = 'No products found matching the criteria'
        }
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          this.errorMessage = 'No products found matching the criteria'
        } else {
          this.errorMessage = 'Error fetching products'
        }
      }
    },

    debounceSearchProducts: debounce(function (this: any) {
      this.searchProducts()
    }, 500),
    goToPage(page: number) {
      this.currentPage = page
      this.debounceSearchProducts()
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++
        this.debounceSearchProducts()
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--
        this.debounceSearchProducts()
      }
    },
    openModal(product: any) {
      this.selectedProduct = product
      this.showModal = true
    },
    closeModal() {
      this.showModal = false
    },
    addToCart(product: any) {
      const cartItem = this.cart.find((item: any) => item.id === product.id)
      if (!cartItem) {
        this.cart.push({ ...product, quantity: 1 })
      } else {
        cartItem.quantity += 1
      }
      localStorage.setItem('cart', JSON.stringify(this.cart))
    },
    getCartQuantity(productId: number) {
      return this.cart.filter((p: any) => p.id === productId).length
    }
  },
  mounted() {
    this.searchProducts()
  }
})
</script>

<style scoped>
body {
  font-family: 'Arial', sans-serif;
  background-color: #f4f7f9;
  color: #333;
}

.auth-buttons {
  margin: auto;
  display: flex;
  justify-content: flex-end;
  max-width: 80rem;
}

.header {
  margin-top: 6rem;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.cart-section {
  display: flex;
}

.modal-description-label {
  font-weight: 550;
}

.modal-price {
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: #616e70;
}

.modal-qty {
  margin-bottom: 10px;
}

.modal-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  max-width: 700px;
  width: 90%;
  position: relative;
}

.modal-main {
  display: flex;
}

.modal-title {
  font-weight: 600;
  font-size: 1.5rem;
}

.modal-outofstock {
  color: red;
}

.modal-product-image {
  max-width: 250px;
  max-height: 250px;
  height: auto;
  border-radius: 8px;
}

.close {
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 1.5rem;
  cursor: pointer;
  color: #555;
}

.close:hover {
  color: #f00;
}

.btn.add-cart-btn {
  background-color: #28a745;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
  width: 100%;
  margin-bottom: auto;
}

.modal-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px 10px 0px 10px;
}

.btn.add-cart-btn:hover {
  background-color: #218838;
}

.marketplace-container {
  min-height: 80vh;
  border: 1px solid #ccc;
  border-radius: 20px;
  margin: auto;
  max-width: 80rem;
  height: 100%;
  display: flex;
  position: relative;
}

.add_to_cart_button {
  display: flex;
  flex-direction: row;
}

.filters {
  margin-top: 0.5%;
  height: auto;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border-right: 2px solid #ddd;
  overflow-y: auto;
  overflow-x: hidden;
  width: 30%;
}

.search-form {
  display: flex;
  flex-direction: column;
}

.input-field {
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.btn {
  padding: 10px;
  margin: 10px 0;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.search-btn {
  background-color: #1e90ff;
}

.pagination {
  padding-top: 10px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-bottom: 10px;
  margin-top: auto;
  max-width: 100%;
}

.pagination-btn {
  background-color: #007bff;
  border: none;
  color: white;
  padding: 8px 16px;
  margin: 0 5px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.pagination-btn:disabled {
  background-color: #c0c0c0;
  cursor: not-allowed;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #0056b3;
}

.pagination-label {
  font-weight: bold;
  font-size: 16px;
  color: #333;
  min-width: 80px;
  text-align: center;
}

.nav-btn-prev,
.nav-btn-next {
  display: flex;
  align-items: center;
}

@media (max-width: 500px) {
  .pagination {
    flex-direction: column;
  }

  .pagination-btn {
    width: 100%;
    margin: 5px 0;
  }

  .pagination-label {
    margin: 10px 0;
  }
}

.error-message {
  color: rgb(105, 105, 105);
  font-weight: bold;
  font-size: 1.2em;
  text-align: center;
  margin: 20px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.nav-btn-prev,
.nav-btn-next {
  display: flex;
  align-items: center;
  flex-direction: row;
}

.products {
  width: 100%;
  padding: 1rem;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
  width: 100%;
}

.product-card {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  text-align: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  max-width: 200px;
  margin: 0 auto;
  width: 100%;
}

.product-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
}

.image-container {
  min-height: 200px;
  position: relative;
  display: flex;
}

.cart-tag {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgb(239, 246, 255);
  color: rgba(37, 136, 223, 0.84);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  z-index: 10;
}

.outofstock-tag {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgb(255, 239, 239);
  color: rgba(223, 37, 37, 0.84);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  z-index: 10;
}

.product-name {
  margin-top: 20px;
  text-align: left;
  font-size: 1.2em;
  margin-bottom: 10px;
}

.product-price {
  font-weight: bold;
  margin-top: 15px;
  text-align: left;
  color: #000000;
  font-size: 1.1em;
  margin-bottom: 10px;
}

.product-quantity {
  margin-bottom: 15px;
}

.cart-quantity {
  margin-top: 10px;
  font-weight: bold;
  color: green;
}

.modal {
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.4);
}

.modal-content {
  background-color: #fefefe;
  margin: 10% auto;
  padding: 20px;
  border: 1px solid #888;
  width: 40%;
  position: relative;
}

.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
}

.close:hover,
.close:focus {
  color: #000;
  text-decoration: none;
  cursor: pointer;
}

@media (max-width: 768px) {
  .products {
    width: 100%;
    padding-left: 0;
    margin-left: 0;
  }

  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}

@media (max-width: 480px) {
  .products {
    width: 100%;
    padding-left: 0;
    margin-left: 0;
  }

  .product-grid {
    grid-template-columns: 1fr;
  }

  .filters {
    width: 100%;
    position: relative;
    height: auto;
    border-right: none;
  }

  .blurred {
    filter: blur(10px);
    transition: filter 0.3s ease-out;
  }
}
</style>
