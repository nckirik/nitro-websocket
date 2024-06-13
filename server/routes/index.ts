export default eventHandler(async (event) => {
  return await useStorage('assets:templates').getItem('index.html');
});
