// lib/config.js
// Single source of truth for RewardX's earning rules.
// Change numbers here (not in the frontend) to change how the app behaves.

module.exports = {
  BOT_USERNAME: 'REWARDX1BOT',

  // 1 USD = 5000 points  ->  1 point = 0.0002 USD
  POINTS_PER_USD: 5000,

  // Referral bonus, paid to the REFERRER, in 3 stages, total 100 points per friend:
  REFERRAL_BONUS_STAGE_START: 40,      // when the invited friend opens the bot
  REFERRAL_BONUS_STAGE_TASKS: 40,      // when the invited friend completes ALL active tasks
  REFERRAL_BONUS_STAGE_WITHDRAW: 20,   // when the invited friend makes their FIRST withdrawal

  // Withdrawal rules
  MIN_WITHDRAWAL_POINTS: 1500,   // $0.30
  MAX_WITHDRAWAL_POINTS: 2500,   // $0.50
  MAX_WITHDRAWALS_PER_DAY: 2,
  MIN_REFERRALS_TO_WITHDRAW: 5,
  REQUIRE_ALL_TASKS_TO_WITHDRAW: true,
};
