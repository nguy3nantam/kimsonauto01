import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, ChevronRight, Newspaper } from 'lucide-react';
import { api } from '../services/api';

function ArticleMeta({ article }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
      {article.date && <span className="inline-flex items-center gap-1.5"><Calendar size={14} aria-hidden="true" /> {article.date}</span>}
      {article.readTime && <span className="inline-flex items-center gap-1.5"><Clock size={14} aria-hidden="true" /> {article.readTime}</span>}
    </div>
  );
}

function NewsList() {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(false);
    api.getNews()
      .then(data => {
        if (!Array.isArray(data)) throw new Error('Invalid news response');
        if (isMounted) setNewsList(data);
      })
      .catch(() => {
        if (isMounted) setError(true);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [attempt]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-16">
      <header className="text-center max-w-3xl mx-auto">
        <div className="inline-block text-xs font-bold text-primary uppercase tracking-[0.15em] border-b-2 border-primary pb-1 mb-2.5">
          TRUYỀN THÔNG & ĐỐI NGOẠI
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.3]">
          Tin Tức & Thông Cáo Báo Chí
        </h1>
        <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
          Cập nhật các hoạt động hợp tác chiến lược, thông cáo sự kiện và định hướng phát triển của Hệ sinh thái Kim Sơn Automobiles.
        </p>
      </header>

      {loading ? (
        <p role="status" className="py-12 text-center text-slate-600">Đang tải tin tức...</p>
      ) : error ? (
        <div role="alert" className="py-12 text-center space-y-4">
          <p className="text-slate-600">Chưa thể tải tin tức. Vui lòng thử lại.</p>
          <button type="button" onClick={() => setAttempt(value => value + 1)} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-dark">
            Thử lại
          </button>
        </div>
      ) : newsList.length === 0 ? (
        <p role="status" className="py-12 text-center text-slate-600">Chưa có tin tức được xuất bản.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {newsList.map(item => (
            <Link
              key={item.id}
              to={`/tin-tuc/${encodeURIComponent(item.id)}`}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary transition-all duration-300 flex flex-col group"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                {item.image ? (
                  <img src={item.image} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-300"><Newspaper size={48} aria-hidden="true" /></div>
                )}
                {item.category && <span className="absolute top-4 left-4 right-4 w-fit bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full">{item.category}</span>}
              </div>
              <div className="p-6 sm:p-8 flex-grow flex flex-col justify-between gap-4">
                <div>
                  <ArticleMeta article={item} />
                  <h2 className="mt-3 text-lg font-black text-slate-900 group-hover:text-primary transition-colors leading-snug break-words">{item.title}</h2>
                  <p className="text-sm text-slate-600 leading-relaxed mt-2 line-clamp-3 break-words">{item.summary}</p>
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 text-xs font-bold text-primary">
                  <span>Xem thông cáo chi tiết</span>
                  <ChevronRight size={14} aria-hidden="true" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function NewsArticle({ id }) {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    api.getArticle(id)
      .then(data => {
        if (!data || typeof data.title !== 'string') throw new Error('Invalid article response');
        if (isMounted) setArticle(data);
      })
      .catch(err => {
        if (isMounted) setError(err.status === 404 ? 'not-found' : 'unavailable');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [id, attempt]);

  useEffect(() => {
    if (!loading) {
      const title = error === 'not-found' ? 'Không tìm thấy bài viết' : error ? 'Không thể tải bài viết' : article?.title;
      if (title) document.title = `${title} - Kim Sơn Automobiles`;
    }
  }, [article, loading, error]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <Link to="/tin-tuc" className="inline-flex items-center gap-2 mb-6 text-sm font-bold text-primary hover:underline">
        <ArrowLeft size={16} aria-hidden="true" /> Tất cả tin tức
      </Link>

      {loading ? (
        <p role="status" className="py-12 text-center text-slate-600">Đang tải bài viết...</p>
      ) : error ? (
        <div role="alert" className="py-12 text-center space-y-4">
          <h1 className="text-2xl font-extrabold text-slate-900">{error === 'not-found' ? 'Không tìm thấy bài viết' : 'Không thể tải bài viết'}</h1>
          <p className="text-slate-600">{error === 'not-found' ? 'Bài viết không tồn tại hoặc chưa được xuất bản.' : 'Vui lòng thử lại sau ít phút.'}</p>
          {error !== 'not-found' && (
            <button type="button" onClick={() => setAttempt(value => value + 1)} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-dark">
              Thử lại
            </button>
          )}
        </div>
      ) : article && (
        <article className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
          {article.image && <img src={article.image} alt={article.title} className="w-full aspect-[16/9] object-cover" />}
          <div className="p-5 sm:p-8 lg:p-10 space-y-6">
            <header className="space-y-4">
              {article.category && <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{article.category}</span>}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight break-words">{article.title}</h1>
              <ArticleMeta article={article} />
            </header>
            {article.summary && <p className="text-base font-semibold text-slate-700 border-l-4 border-primary pl-4 leading-relaxed whitespace-pre-wrap break-words">{article.summary}</p>}
            <div className="text-base text-slate-700 leading-8 whitespace-pre-wrap break-words">
              {article.content || 'Nội dung chi tiết đang được cập nhật.'}
            </div>
          </div>
        </article>
      )}
    </div>
  );
}

export default function NewsPage() {
  const { id } = useParams();

  return (
    <div className="bg-slate-50 min-h-screen py-10 sm:py-16">
      {id ? <NewsArticle key={id} id={id} /> : <NewsList />}
    </div>
  );
}
