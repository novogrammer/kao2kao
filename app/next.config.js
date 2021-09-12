
const debug = process.env.NODE_ENV !== 'production'

const assetPrefix="";

module.exports = {
  trailingSlash:true,
  assetPrefix,
  //参照用
  publicRuntimeConfig:{
    assetPrefix,
  }
}
