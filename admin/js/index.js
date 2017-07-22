new Vue({
  el: '#app',
  data: {
    list: []
  },
  methods: {
    switchMockData: function (mock, option) {
      if (mock.responseKey === option.key) return
      $.ajax({
        url: './update',
        data: {
          mockName: mock.name,
          responseKey: option.key
        },
        dataType: 'json',
        success: function (data) {
          mock.responseKey = option.key
        }
      })
    }
  },
  mounted: function () {
    var self = this
    $.ajax({
      url: './list',
      dataType: 'json',
      success: function (data) {
        self.list = data.data
      }
    })
  }
})
