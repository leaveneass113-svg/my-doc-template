/**
 * progress_calc.js
 * -----------------
 * Derives Group D (weekly) and Group G (monthly) progress tokens.
 * CP / MCP are NOT separately entered by the user — they are always
 * computed from the same underlying weekly/monthly progress numbers,
 * confirmed 2026-08-24.
 */

/**
 * Weekly work-item row (template Group D — single row, not a loop).
 * @param {number|string} currentWeekInput_WW - this week's %ผลงาน contributed (ในสัปดาห์)
 * @param {number|string} previousWeek_WP - cumulative %ผลงาน up to last week (ถึงสัปดาห์ก่อน)
 * @returns {{WW:number, WP:number, WT:number, WC:number, WR:number, CP:number}}
 */
function calculateWeeklyProgress(currentWeekInput_WW, previousWeek_WP = 0) {
  const WW = Number(currentWeekInput_WW); // %ผลงาน ในสัปดาห์นี้
  const WP = Number(previousWeek_WP);     // %ผลงาน สะสมถึงสัปดาห์ก่อน
  const WT = WW;                          // {{WT}} มิเรอร์ค่า WW ตามคอลัมน์ "ในสัปดาห์"
  const WC = WP + WT;                     // {{WC}} สะสมถึงสัปดาห์นี้
  const WR = WC;                          // {{WR}} ผลงานรวม% (แถวเดียว จึง = WC)
  const CP = WC;                          // {{CP}} หน้าสรุปด้านบน = ผลงานสะสมถึงปัจจุบัน

  return { WW, WP, WT, WC, WR, CP };
}

/**
 * Monthly work-item rows (template Group G — up to 3 fixed line items).
 * Each item i has its own weight (MW_i), progress up to last month (MP_i),
 * progress this month (MM_i), cumulative (MC_i), and weighted total (MR_i).
 * @param {Array<{weight_MW:number, prevCum_MP:number, thisMonth_MM:number}>} items - up to 3 entries
 * @returns {object} flattened MN/MW/MP/MM/MC/MR per item (1-3), plus MW_SUM, MT, MCP
 */
function calculateMonthlyProgress(items) {
  const rows = items.slice(0, 3).map((item, idx) => {
    const MW = Number(item.weight_MW);       // สัดส่วนของงาน% ของรายการนี้
    const MP = Number(item.prevCum_MP);      // ผลงาน% ถึงเดือนก่อน
    const MM = Number(item.thisMonth_MM);    // ผลงาน% ในเดือนนี้
    const MC = MP + MM;                      // ผลงาน% สะสม
    const MR = (MW * MC) / 100;              // ผลงานรวม% (ถ่วงน้ำหนักด้วยสัดส่วนงาน)
    return { index: idx + 1, MW, MP, MM, MC, MR };
  });

  const result = { MW_SUM: 0, MT: 0 };
  rows.forEach((r) => {
    result[`MN${r.index}`] = r.index;
    result[`MW${r.index}`] = r.MW;
    result[`MP${r.index}`] = r.MP;
    result[`MM${r.index}`] = r.MM;
    result[`MC${r.index}`] = r.MC;
    result[`MR${r.index}`] = r.MR;
    result.MW_SUM += r.MW;
    result.MT += r.MR;
  });

  result.MCP = result.MT; // {{MCP}} หน้าสรุปด้านบน = ผลงานรวม% สะสมทุกรายการ (ทำนองเดียวกับ CP)

  return result;
}

module.exports = { calculateWeeklyProgress, calculateMonthlyProgress };
