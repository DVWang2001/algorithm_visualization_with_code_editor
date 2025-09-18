//這個C++標頭檔的作用是使用函數在html上的canvas畫圈。
#include <bits/stdc++.h>
using namespace std;
double big_r = 100.0;
double r = 10.0;
int number = 0;
double max_number = 40;
// 很厲害的複變公式 (r cos 2kπ/n, r sin 2kπ/n)
auto circleLocation = [](double r, int k, int n) {
    double angle = M_PI - 2.0 * M_PI * k / n;
    return make_pair(r * cos(angle), r * sin(angle));
};
void drawCircle(int x,int y,int fixX,int fixY,int r,string massage = "") {
    // 使用JavaScript的Canvas API來畫圓
    cout << "drawCircle(" << fixX+x << "," << fixY+y << ", " << r << ", " << massage << ");" << endl;
}

void drawLineBetweenCircles(string c1,string c2){
    // 使用JavaScript的Canvas API來畫線
    cout << "drawLineBetweenCircles(" << c1 << ", " << c2 << ");" << endl;
}