const { authApi } = require('./src/mocks/auth');
(async () => {
  try {
    const res = await authApi.login({ username: 'admin@puma.com', password: 'admin123' });
    if (res?.data?.status === 'SUCCESS') {
      console.log('TOKEN:', res.data.data.token);
    } else {
      console.error('Login failed', res?.data);
    }
  } catch (e) {
    console.error('Error', e);
  }
})();
