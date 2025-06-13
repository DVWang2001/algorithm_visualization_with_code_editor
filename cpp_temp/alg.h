//這個C++標頭檔的作用是使用函數在html上的canvas畫圈。
#include <bits/stdc++.h>
using namespace std;
double big_r = 100.0;
double r = 10.0;
int number = 0;
double max_number = 40;
// 很厲害的複變公式 (r cos 2kπ/n, r sin 2kπ/n)
auto circleLocation = [](double r, int k, int n) {
    return make_pair(r * cos(2.0 * k * M_PI / n), r * sin(2.0 * k * M_PI / n));
};
void drawCircle(int x,int y,int r,string massage = "") {
    // 使用JavaScript的Canvas API來畫圓
    cout << "drawCircle(" << x << "," << y << ", " << r << ", " << massage << ");" << endl;
}