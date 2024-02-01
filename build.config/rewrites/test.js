module.exports = [
  {
    source: '/connect/:path*',
    destination: 'https://auth-portkey-test.portkey.finance/connect/:path*',
  },
  {
    source: '/portkey/:path*',
    destination: 'https://did-portkey-test.portkey.finance/:path*',
  },
  {
    source: '/api/:path*',
    destination: 'https://test.beangotown.com/api/:path*',
  },
  {
    source: '/cms/:path*',
    destination: 'https://test-cms.beangotown.com/:path*',
  },
  {
    source: '/AElfIndexer_DApp/PortKeyIndexerCASchema/:path*',
    destination: 'http://192.168.67.51:8083/AElfIndexer_DApp/PortKeyIndexerCASchema/:path*',
  },
  {
    source: '/AElfIndexer_BeangoTown/BeangoTownIndexerPluginSchema/:path*',
    destination: 'https://test.beangotown.com/AElfIndexer_BeangoTown/BeangoTownIndexerPluginSchema/:path*',
  },
];
