import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Home, Phone } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-slate-50 px-4 py-16">
      <div className="text-center max-w-md bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-xl space-y-6">
        <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <Car size={40} />
        </div>
        <h1 className="text-6xl font-black text-slate-900 tracking-tight">404</h1>
        <h2 className="text-xl font-bold text-slate-800">Không Tìm Thấy Trang</h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          Đường dẫn bạn yêu cầu không tồn tại hoặc đã được thay đổi trong hệ thống Kim Sơn Automobiles.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            to="/"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white py-3 rounded-xl font-bold text-sm shadow transition-all"
          >
            <Home size={16} />
            <span>Về Trang Chủ</span>
          </Link>
          <a
            href="tel:0908123456"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 py-3 rounded-xl font-bold text-sm transition-all"
          >
            <Phone size={16} />
            <span>Hotline 24/7</span>
          </a>
        </div>
      </div>
    </div>
  );
}
