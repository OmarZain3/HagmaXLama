import { Link } from 'react-router-dom';
import { Button } from '@/components/Button';

export function Landing() {

  return (
    <div className="bg-pattern-2 bg-pattern-overlay flex min-h-screen flex-col items-center justify-center px-4 font-poppins">
      <img src="/Asset 6.png" alt="Hagma X Lamma Fantasy" className="mb-6 h-32 w-auto max-w-[280px] object-contain md:h-40" />
      <h1 className="mb-2 text-center text-4xl font-extrabold text-[#F8ECA7] md:text-5xl lg:text-6xl">
        Welcome to Hagma X Lamma Fantasy
      </h1>
      <p className="mb-8 text-center text-[#EECC4E] text-lg">Fantasy Football</p>
      <div className="flex w-full max-w-xs flex-col gap-4">
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
