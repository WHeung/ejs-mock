(function () {
var editor1 = null;
var editor2 = null;

new Vue({
  el: '#app',
  data: {
    list: [],
    curMock: {},
    curOption: {},
    view: 'mock',
    query: '',
    mask: null,
    mockForm: {},
    optionForm: {}
  },
  methods: {
    initList () {
      var self = this
      $.ajax({
        url: './list',
        dataType: 'json',
        success: function (data) {
          self.list = data.data
          self.curMock = JSON.parse(JSON.stringify(self.list[0]))
          if (self.curMock.responseKey && self.curMock.responseOptions && typeof self.curMock.responseOptions === 'object') {
            self.curOption = self.curMock.responseOptions[self.curMock.responseKey]
          } else {
            self.curOption = {}
          }
        }
      })
    },
    switchMockData: function (mock, option) {
      if (mock.responseKey === option.key) return
      var self = this
      $.ajax({
        url: './update_response_key',
        data: {
          mockName: mock.name,
          responseKey: option.key
        },
        dataType: 'json',
        success: function (data) {
          mock.responseKey = option.key
          self.curOption = mock.responseOptions[option.key]
        }
      })
    },
    switchMock: function (mock) {
      this.curMock = JSON.parse(JSON.stringify(mock))
      this.curOption = mock.responseOptions && typeof mock.responseOptions === 'object' ? mock.responseOptions[mock.responseKey] : {}
    },
    addMock: function () {
      this.mockForm = {}
      this.mask = 'mock'
    },
    addOption: function () {
      this.optionForm = {}
      this.mask = 'option'
    },
    saveMock: function (mockData) {
      $.ajax({
        url: './update_mock',
        method: 'POST',
        data: mockData,
        dataType: 'json',
        success: () => {
          this.initList()
          this.closeMask()
        }
      })
    },
    saveOption: function (optionData, type) {
      console.log(this.curMock.responseOptions)
      const options = this.curMock.responseOptionsList
      if (type === 'add' && options && options.length) {
        const index = options.findIndex(item => {
          return item.key === optionData.name
        })
        if (index >= 0) {
          window.alert('you already have this response')
          return
        }
      }
      if (type === 'change' && optionData.key && !optionData.name) {
        optionData.name = optionData.key
      }
      $.ajax({
        url: './update_option',
        method: 'POST',
        data: {
          mockName: this.curMock.name,
          ...optionData
        },
        dataType: 'json',
        success: () => {
          $.ajax({
            url: './list',
            dataType: 'json',
            success: (data) => {
              this.list = data.data
              this.curMock = this.list.find(item => {
                return item.name === this.curMock.name
              })
              this.curOption = this.curMock.responseOptions[this.curMock.responseKey]
            }
          })
          this.closeMask()
        }
      })
    },
    closeMask: function () {
      this.mockForm = {}
      this.option = []
      this.mask = null
    },
    saveTemplate: function () {
      var val = editor1.getValue()
      var self = this
      $.ajax({
        url: './update_template',
        method: 'POST',
        data: {
          template: val,
          path: self.curOption.path
        },
        dataType: 'json',
        success: function (data) {
          self.curOption.template = val
          alert('save successed!')
        }
      })
    },
    switchView (view) {
      this.view = view
    },
    showData () {
      this.switchView('result')
      $.ajax({
        url: this.curMock.url + `?${this.query}`,
        dataType: 'json',
        success: function (data) {
          editor2.setValue(JSON.stringify(data, null, 2))
        }
      })
    }
  },
  watch: {
    curOption: function (val, oldVal) {
      if (editor1) {
        editor1.setValue(val.template)
      }
      if (editor2 && this.view === 'result') {
        this.showData()
      }
    }
  },
  mounted: function () {
    this.initList()
  }
})

editor1 = CodeMirror.fromTextArea(document.getElementById("editor1"), {
  mode: "application/json",
  gutters: ["CodeMirror-lint-markers"],
  lint: true,
  styleActiveLine: true,
  lineNumbers: true,
  lineWrapping: true,
  theme: 'material'
})

editor2 = CodeMirror.fromTextArea(document.getElementById("editor2"), {
  mode: "application/json",
  gutters: ["CodeMirror-lint-markers"],
  lint: true,
  styleActiveLine: true,
  lineNumbers: true,
  lineWrapping: true,
  theme: 'material'
})

})()
