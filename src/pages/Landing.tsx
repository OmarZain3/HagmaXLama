import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/Button';
import { useAuth } from '@/context/AuthContext';

const DEMO_USER = {
  userId: 'demo',
  name: 'Demo User',
  teamName: 'Demo Team',
  isAdmin: true,
};

export function Landing() {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const enterDemo = () => {
    setUser(DEMO_USER);
    navigate('/dashboard');
  };

  return (
    <div className="bg-pattern-2 bg-pattern-overlay flex min-h-screen flex-col items-center justify-center px-4 font-poppins">
      <img src="/Asset 6.png" alt="Hagma X Lamma Fantasy" className="mb-6 h-32 w-auto max-w-[280px] object-contain md:h-40" />
      <h1 className="mb-2 text-center text-4xl font-extrabold text-[#F8ECA7] md:text-5xl lg:text-6xl">
        Welcome to Hagma X Lamma Fantasy
      </h1>
      <p className="mb-8 text-center text-[#EECC4E] text-lg">Fantasy Football</p>
      <div className="flex w-full max-w-xs flex-col gap-4">
        <Button fullWidth variant="primary" onClick={enterDemo}>
          Try demo – see all pages
        </Button>
        <Link to="/login">
          <Button fullWidth variant="secondary">
            Log in
          </Button>
        </Link>
        <Link to="/signup">
          <Button fullWidth variant="ghost" className="!border-[#EECC4E] !text-[#EECC4E]">
            Sign up
          </Button>
        </Link>
      </div>
    </div>
  );
}
