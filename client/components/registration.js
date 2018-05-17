const RegistrationComponent = {
  template: `
    <div>
      <form @submit.prevent="submit">
        <label>Email</label>
        <input type="text" v-model="email" :disabled="loading" />
        <br/>
        <label>Password</label>
        <input type="password" v-model="password" :disabled="loading" />
        <br/>
        <button type="submit" :disabled="loading">Register</button>
        <br/>
        <span v-if="message">{{message}}</span>
      </form>
    </div>
  `,
  data() {
    return {
      email: '',
      password: '',
      message: '',
      loading: false,
    };
  },
  methods: {
    submit() { // register
      this.loading = true;
      http.post('/rest/register', {
        email: this.email,
        password: this.password,
      }).then(response => {
        console.log(response);
        this.loading = false;
        if(response.data.email) {
          this.message = 'Registration complete';
        } else {
          this.message = 'Failed registration';
        }
      }).catch(error => {
        this.loading = false;
        this.message = 'Failed registration';
      });
    }
  },
  watch: {
    email() {
      this.message = '';
    },
    password() {
      this.message = '';
    }
  }
}


