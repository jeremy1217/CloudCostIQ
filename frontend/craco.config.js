module.exports = {
  style: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },
  babel: {
    plugins: [
      process.env.NODE_ENV === 'development' && require.resolve('react-refresh/babel'),
    ].filter(Boolean),
  },
} 