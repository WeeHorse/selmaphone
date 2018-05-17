Vue.component('registration', RegistrationComponent);
Vue.component('login', LoginComponent);
Vue.component('product', ProductComponent);
Vue.component('product-editor', ProductEditor);

const http = axios; // using axios 3rd party XHR/REST lib

let app = new Vue({
  el: "#app",
  created(){
    // ladda in litta data
    // http.get('/rest/products').then(response => {
    //   this.products = response.data;
    // }).catch(e => {
    //   console.error(e);
    // });
  },
  data(){
    return {
      brand: "Selmaphone",
      products: []
    }
  }
});
