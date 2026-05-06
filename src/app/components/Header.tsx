import { Search, Sparkles, User } from 'lucide-react';

interface HeaderProps {
  onSearch?: (query: string) => void;
  onAIClick?: () => void;
  currentPage?: string;
}

export function Header({ onSearch, onAIClick, currentPage = 'Mapa' }: HeaderProps) {
  const menuItems = [
    { name: 'Mapa', href: '/' },
    { name: 'Instituições', href: '/instituicoes' },
    { name: 'Atividades', href: '/atividades' },
    { name: 'Analítico', href: '/analitico' },
    { name: 'Admin', href: '/admin' }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <img
              src="/cajamar-logo.gif"
              alt="Cajamar"
              className="w-7 h-7 object-contain"
            />
            <span className="text-xl font-semibold text-foreground">Educa Cajamar</span>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {menuItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentPage === item.name
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                {item.name}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onAIClick}
            className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-lg transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Perguntar à IA</span>
          </button>

          <button className="p-2 rounded-lg hover:bg-accent transition-colors">
            <User className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </div>
    </header>
  );
}
