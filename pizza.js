
function pizzaCart() {

  return {
    title: '',
    pizzas: [],
    username: '',
    cartId: '',
    cartPizzas: [],
    historyCartsIds: [],
    pastOrderedPizzas: [],
    cartTotal: 0,
    paymentAmount: 0,
    message: '',
    usernameSet: false,
    displayHistory: false,
    featuredPizzas: [],
    change:0,
    paymentStatus:'',
    cartDisplayed:false,
    init() {
      const url = 'https://pizza-api.projectcodex.net/api/pizzas';
      axios.
        get(url).then(
          result => {
            this.pizzas = result.data.pizzas

          })
        .catch((error) => {
          console.error(error);
        })

      this.setUsername();
      
      
      this.getDataFromStorage();
    
      this.title = this.username + "'s" + ' Pizza Cart'
      
      
      
      this.showCartData();
   
    },
    getDataFromStorage() {
  
      const storedCartId = localStorage.getItem('cartId');
      const username = localStorage.getItem('username');
      if (storedCartId && username) {
        this.cartId = storedCartId;
        this.username = username;
        this.usernameSet=true;

      }
    },
   
   
    setCartCode() {
      if (this.cartId === '') {
        this.getDataFromStorage();
        if (this.cartId === '') {
          this.createCart();
        }
      }
    },
    setUsername() {
      if (this.username.length > 2 ) {
        this.usernameSet = true;
        this.createCart();
        localStorage.setItem('usernameSet', this.usernameSet);
        localStorage.setItem('username', this.username);
        this.title = this.username + "'s" + ' Pizza Cart'; // Update the cart title
      } else {
        this.getDataFromStorage();
        if(!this.usernameSet){
          alert('Username must have at least 3 characters');
        }
        
      }
    },
    
    showCartData() {
      this.getCart().then(result => {
        const cartData = result.data;
        this.cartPizzas = cartData.pizzas;
        this.cartTotal = cartData.total;
      })
    },
    getCart() {
      const getCartUrl = `https://pizza-api.projectcodex.net/api/pizza-cart/${this.cartId}/get`
      return axios.get(getCartUrl)
    },
    addToCart(pizzaId) {
      const addToCartUrl = 'https://pizza-api.projectcodex.net/api/pizza-cart/add';
      const data = {
        cart_code: this.cartId,
        pizza_id: pizzaId
      };
      const headers = {
        'Content-Type': 'application/json'
      };

      axios.post(addToCartUrl, data, { headers })
        .then(()=>{
          this.showCartData()
          this.showCartData()
        }
          
          )
        .catch(error => {
          alert(error)
        });
    
    }
    ,
    removeFromCart(pizzaId) {
      const removeToCartUrl = 'https://pizza-api.projectcodex.net/api/pizza-cart/remove';
      const data = {
        cart_code: this.cartId,
        pizza_id: pizzaId
      };
      const headers = {
        'Content-Type': 'application/json'
      };

      axios.post(removeToCartUrl, data, { headers })
        .then(()=>{
          this.showCartData()
          this.showCartData()
        })
        .catch(error => {
          alert(error)
        });

    },

    createCart() {
      return axios.get(
        `https://pizza-api.projectcodex.net/api/pizza-cart/create?username=${this.username}`
      ).then(result => {
        this.cartId = result.data.cart_code;
        localStorage.setItem('cartId', this.cartId);
      });
    },

    payPizza() {
      if(this.cartTotal===0){
        return alert('Add at least one pizza to the cart');
      }
      const payCartUrl = 'https://pizza-api.projectcodex.net/api/pizza-cart/pay';
      const data = {
        "cart_code": this.cartId,
        "amount": this.paymentAmount
      };
      const headers = {
        'Content-Type': 'application/json'
      };

      axios.post(payCartUrl, data, { headers })
        .then(result => {
          this.message = result.data.message
          this.paymentStatus=result.data.status
          //change:0,
    
          if ( this.paymentStatus=== 'failure') {
            
            if(!parseInt (this.paymentAmount) && this.paymentAmount!==0){
              alert('Invalid amount: '+this.paymentAmount);
              this.paymentAmount=0;
            }
            setTimeout(() => {
              this.message = '';
            }, 2500);
            
          } else {
            this.change= this.paymentAmount - this.cartTotal;
            this.message=this.message+' Here is your change R'+this.priceFormat(this.change)
            setTimeout(() => {
              this.change=0;
              this.cartPizzas = [];
              this.cartTotal = 0;
              this.paymentAmount = 0;
              this.message = '';
              localStorage.removeItem('cartId');
              this.createCart();
            }, 2500)
          }
        }

        )
        .catch(error => {
          alert(error)
        });
    },
    displayCart(){
      this.cartDisplayed=true;
    },
    closeCart(){
      this.cartDisplayed=false;
    },
    orderHistory() {

      const orderHistoryUrrl = `https://pizza-api.projectcodex.net/api/pizza-cart/username/${this.username}`
      axios.get(orderHistoryUrrl).then(
        result => {

          this.historyCartsIds = result.data.filter(cart => cart.status === 'paid');
          this.activateDisplayHistory();
        }
      )

    },
    historyPizzas(){
      this.orderHistory() ;
      this.orderHistory() ;
    },
    getPastOrders(CartCode) {

      const getCartUrl = `https://pizza-api.projectcodex.net/api/pizza-cart/${CartCode}/get`;
      return axios.get(getCartUrl)
        .then(result => {

          this.pastOrderedPizzas.push({ 'pizzas': result.data.pizzas, 'total': result.data.total, 'cartId': result.data.id });
      
        })


    },
    activateDisplayHistory() {
      this.displayHistory = true;
      this.cartDisplayed=true;//hide cart button
    },
    newOrder() {
      this.displayHistory = false;
      this.cartDisplayed=false;
    },
    logout() {
      if (confirm('Are you sure you want to log out?')) {
        this.cartPizzas = [];
        this.cartTotal = 0;
        this.paymentAmount = 0;
        localStorage.removeItem('cartId');
        this.createCart()
        localStorage.removeItem('username');
        this.username = '';
        this.usernameSet = false;
        this.pastOrderedPizzas=[];
        this.newOrder();
        this.closeCart();
      }
    },
    // 
   
    getFeaturedPizzas() {

      const getCartUrl = `https://pizza-api.projectcodex.net/api/pizzas/featured?username=Brianmahlatse`;
      axios.get(getCartUrl)
        .then(result => {
          
          this.featuredPizzas = result.data.pizzas;
        })
    },
    priceFormat(price) {
      return parseFloat(price.toFixed(2));
    },
    getPizzaImageSource(size) {
      return `./images/${size}-pizza.jpg`;
    }


  };
}


document.addEventListener('alpine:init', () => {
  Alpine.data('PizzaCartAPI', pizzaCart);
});