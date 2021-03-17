const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  tel: String,
  name: String,
  password: String,
  role: String,
  staffId: String,
  competitions: [
    {
      competition: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'competition',
      },
      isCaptain: {
        type: Boolean,
        default: false,
      },
      // appendix: {
      //   type: Object,
      //   default: {
      //     isSubmit: {
      //       type: Boolean,
      //       default: false,
      //     },
      //     name: {
      //       type: String,
      //       default: '',
      //     },
      //     url: {
      //       type: String,
      //       default: '',
      //     },
      //     fileType: {
      //       type: String,
      //       default: '',
      //     },
      //     size: {
      //       type: Number,
      //       default: 0,
      //     },
      //     uid: {
      //       type: String,
      //       default: '',
      //     },
      //   },
      // },
      teamId: mongoose.Schema.Types.ObjectId,
    },
  ],
});

const User = mongoose.model('user', UserSchema);
module.exports = User;
