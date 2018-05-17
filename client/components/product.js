const ProductComponent = {

  props: ['item'],

  template: `
    <div>
      <h2>{{item.title}}</h2>
      <p v-html="item.content"></p>
    </div>
  `

}
