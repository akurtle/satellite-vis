import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Button } from '@mui/material';
import { ShootingStars } from './ui/shadcn-io/shooting-stars';

function Banner() {
    const text = ["A", "Stunning", "Satellite", "Visualizer"]

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            window.scrollTo({ top: 1000, behavior: 'smooth' });
        }
    };

    return (
        
        <div className='h-screen flex flex-col justify-center items-center'>
            <div className="absolute inset-0 ">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.1)_0%,rgba(0,0,0,0)_70%)]" />
                <div className="stars absolute inset-0" />
            </div>
            <ShootingStars starColor='white' className='h-screen ' />
            <div className='flex gap-4'>
                <div className='flex gap-3'>
                    {text.map((item) => (
                        <div className=' rounded-2xl  p-3 hover:bg-amber-400 hover:animate-bounce
                        cursor-default text-white text-3xl'>{item}</div>
                    ))}
                </div>
            </div>
            <div className='bg-amber-300 w-[70px] h-[70px] animate-bounce rounded-full absolute bottom-[10%] flex justify-center items-center'>
                <Button disableRipple className='rounded-full w-[70px] h-[70px]' onClick={() => scrollToSection("visualizer")}><KeyboardArrowDownIcon className='rounded-full' /></Button>
            </div>
        </div>
    )
}

export default Banner