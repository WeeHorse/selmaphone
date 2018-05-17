const ProductEditor = {

  template: `
    <form @submit.prevent="submit">
      <fieldset>
        <legend>Skapa en ny produkt</legend>
        <input :disabled="loading" type="text" v-model="title">
        <br>
        <input :disabled="loading" type="text" v-model="price">
        <br>
        <textarea :disabled="loading" v-model="content"></textarea>
        <br>
        <input :disabled="loading" type="submit" value="Spara">
      </fieldset>
    </form>
  `,

  methods:{
    submit(){
      this.loading = true;
      let data = {
        title: this.title,
        content: this.content,
        price: this.price
      };
      let method = 'post';
      if(this._id){
        method = 'put';
        data._id = this._id;
      }
      http[method]('/products', data).then(result => {
        this.loading = false;
        console.log('result', result);
      }).catch(e => {
        this.loading = false;
        console.error(e);
      });
    }
  },

  data(){
    return {
      title: '',
      content: '',
      price: '',
      loading: false
    }
  }

}
