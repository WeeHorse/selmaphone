
class ExampleEditor extends Editor{ // class ExampleComponent extends Component

  data(){
    return {
      title: '',
      content: '',
      loading: false
    }
  }

  methods(){
    return {
      submit(){
        this.loading = true;
        let data = {
          title: this.title,
          content: this.content
        };
        let method = 'post';
        if(this._id){
          method = 'put';
          data._id = this._id;
        }
        http[method]('/insurances', data).then(result => {
          this.loading = false;
          console.log('result', result);
        }).catch(e => {
          this.loading = false;
          console.error(e);
        });
      }
    }
  }

}
