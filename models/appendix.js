const { string } = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AppendixSchema = new Schema({
  name: {
    type: String,
    default: '',
  },
  url: {
    type: String,
    default: '',
  },
  fileType: {
    type: String,
    default: '',
  },
  size: {
    type: Number,
    default: 0,
  },
  uid: {
    type: String,
    default: '',
  },
});

const Appendix = mongoose.model('appendix', AppendixSchema);
module.exports = Appendix;
