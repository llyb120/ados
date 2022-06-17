module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset',
    ['@vue/babel-preset-jsx',
      {
        'injectH': false
      }]
  ],
  plugins: ['module:vue-jsx-classname-to-class', "jsx-v-model" ]
}
