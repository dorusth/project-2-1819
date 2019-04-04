console.log('sercice worker loaded')

self.addEventListener('push', e => {
  const data = e.data.json()

  self.registration.showNotification('Mirabeau meeting-rooms', {
    body: data.title
  })
})
