const { string } = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CompetitionSchema = new Schema({
  title: String,
  desc: String,
  organizer: String,
  content: String,
  team_num: Number,
  start_time: String,
  end_time: String,
  showRank: Boolean, //是否公布成绩
  status: String,
  tags: [String],
  min_people: Number,
  max_people: Number,
  score_teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  teams: [
    {
      _id: mongoose.Schema.Types.ObjectId,
      users: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
          },
          isCaptain: {
            type: Boolean,
            default: false,
          },
        },
      ],
      appendix: {
        type: Object,
        default: {
          isSubmit: {
            type: Boolean,
            default: false,
          },
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
        },
      },
      score: Number,
    },
  ],
  // teams: [
  //   [
  //     {
  //       student: {
  //         type: mongoose.Schema.Types.ObjectId,
  //         ref: 'user',
  //       },
  //       isCaptain: {
  //         type: Boolean,
  //         default: false,
  //       },
  //     },
  //   ],
  // ],
  //待续
});

const Competition = mongoose.model('competition', CompetitionSchema);
module.exports = Competition;
