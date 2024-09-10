/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/files/Internal_Regulation_2011.pdf',
        destination: 'http://localhost:3001/files/Internal_Regulation_2011.pdf',
      },
    ];
  },
};

module.exports = nextConfig;
