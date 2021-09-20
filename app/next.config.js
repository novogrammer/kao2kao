
const debug = process.env.NODE_ENV !== 'production'

const assetPrefix="";

module.exports = {
  reactStrictMode:true,
  trailingSlash:true,
  assetPrefix,
  //参照用
  publicRuntimeConfig:{
    assetPrefix,
    STUN_SERVER_URI:process.env.STUN_SERVER_URI,
  }
}
