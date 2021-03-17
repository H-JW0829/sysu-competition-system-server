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
  fileList: [Object],
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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'appendix',
      },
      score: Number,
    },
  ],
});

const Competition = mongoose.model('competition', CompetitionSchema);
module.exports = Competition;
