
import React, { useState, useEffect } from 'react';
import { readTheme, loadSharedTheme } from '../../services/ThemeService';

export const AppBackground: React.FC = () => {
  const [theme, setTheme] = useState(readTheme);
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches);
  const [imageFailed, setImageFailed] = useState(false);
  const source = (mobile ? theme.mobile || theme.desktop : theme.desktop || theme.mobile);
  useEffect(() => { setImageFailed(false); }, [source]);
  useEffect(() => {
    const refresh = () => setTheme(readTheme());
    const query = window.matchMedia('(max-width: 767px)');
    const resize = () => setMobile(query.matches);
    window.addEventListener('cham-theme-changed', refresh);
    window.addEventListener('storage', refresh);
    query.addEventListener('change', resize);
    void loadSharedTheme();
    return () => {
      window.removeEventListener('cham-theme-changed', refresh);
      window.removeEventListener('storage', refresh);
      query.removeEventListener('change', resize);
    };
  }, []);
  return (
    <div className="adventure-background" aria-hidden="true">
      <div className="adventure-default" />
      {source && !imageFailed && <img src={source} alt="" onError={() => setImageFailed(true)} className="adventure-custom" style={{ filter: 'blur(' + theme.blur + 'px)' }} />}
      <div className="adventure-light" style={{ opacity: theme.lightness }} />
    </div>
  );
};
