// 輸出 JS 指令
#include <bits/stdc++.h>
#include "alg.h"
using namespace std;
void Move(int&n) {
  int tmp = 0;
  while (n) {
    tmp += (n%10)*(n%10);
    n /= 10;
  }
  n = tmp;
}
int main() {
  // 不快樂數
  int number = 2;
  int hare, tortoise;
  // 先確定是不是快樂數
  hare = number;
  tortoise = number;
  do {
    Move(hare);
    Move(hare);
    Move(tortoise);
  } while (hare != tortoise);

  // 如果不是快樂數就計算環長鏈長
  if (hare != 1 && tortoise != 1) {
    vector<int> links;
    vector<int> cycles;
    int link = 0;
    int cycle = 0;
    int cycle_start;
    hare = number;

    // 建立鏈部分
    do {
      links.push_back(hare);
      Move(hare);
      Move(tortoise);
      link++;
    } while (hare != tortoise);

    cycle_start = hare;

    // 建立環部分
    do {
      cycles.push_back(hare);
      Move(hare);
      cycle++;
    } while (hare != tortoise);
    // 儲存所有點的參數
    vector<tuple<int,int,int,int,int,string>>Points;
    // 畫鏈
    auto leftest_circle_pos = circleLocation(big_r, 0, cycles.size());
    int dist = 2 * big_r * sin(M_PI / cycles.size());
    vector<pair<double, double>> links_location;
    for (int i = 0; i < links.size(); i++) {
      double x = leftest_circle_pos.first - dist*(links.size()-i);  // 水平排列
      double y = 0;
      links_location.push_back({x, y});
      Points.emplace_back((int)x, (int)y, 0, 0, r, to_string(links[i]));
      // drawCircle(x, y,0,0, r, to_string(links[i]));
    }
    // 鏈尾最後一點的絕對位置
    double fixX = links_location.back().first;
    double fixY = links_location.back().second;

    // 畫環
    for (int i = 0; i < cycles.size(); i++) {
        auto pos = circleLocation(big_r, i, cycles.size());
        // pos 是相對座標，配合 fixX, fixY 來定位整個環
        Points.emplace_back((int)(pos.first), (int)(pos.second - 2*fixY), 0, 0, r, to_string(cycles[i]));
        // drawCircle((int)pos.first, (int)pos.second, 0, 0, (int)r, to_string(cycles[i]));
    }
    int left_most = INT_MAX,up_most = INT_MIN;
    // 找出最左跟最上的座標
    for (auto& point : Points) {
        int x, y, fixX, fixY, radius;
        string message;
        tie(x, y, fixX, fixY, radius, message) = point;
        if (x < left_most) left_most = x;
        if (y > up_most) up_most = y;
    }
    if (left_most > 0) left_most = 0; // 確保最左邊的點在畫布內
    if (up_most < 0) up_most = 0; // 確保最上邊的點在畫布內
    // 最後一次畫完
    // 假設你原本就用 cout 輸出 JS：drawCircle(x, y, ...);
    int idx = 0;                       // 留意目前是第幾顆圓
    int first_cycle_idx = -1;          // 等一下要把環首尾連起來

    for (auto &point : Points) {
        int x, y, fixX, fixY, radius;
        string message;
        tie(x, y, fixX, fixY, radius, message) = point;
    
        // 調整進畫布座標後
        int drawX = x - left_most;
        int drawY = y + up_most;
    
        /*-- ① 輸出圓 --*/
        drawCircle(drawX, drawY, 0, 0, radius, message);
        
        /*-- ② 如果不是第一顆，就把「上一顆」連過來 --*/
        if (idx > 0) {
            drawLineBetweenCircles("circles[" + to_string(idx - 1) + "]",
                                   "circles[" + to_string(idx) + "]");
        }
      
        /*-- ③ 紀錄環的第一顆圓（方便最後閉環） --*/
        if (idx == links.size()) {   // links 畫完、環開始的那顆
            first_cycle_idx = idx;
        }
      
        ++idx;
    }

    /*-- ④ 讓環首尾相接（閉環） --*/
    if (cycle > 0 && first_cycle_idx != -1) {
        int last_idx = idx - 1;  // 目前最後一顆
        drawLineBetweenCircles("circles[" + to_string(last_idx) + "]",
                               "circles[" + to_string(first_cycle_idx) + "]");
    }
  } else {
    // 是快樂數
    drawCircle(0, 0,0,0, r, "Happy");
  }

  return 0;
}
