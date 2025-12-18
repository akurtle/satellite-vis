import { Button, Input } from '@mui/material'
import React from 'react'
import { satellite_data_links } from './Visualizer'


type SubHeaderProps={
    handleLinkChange:(i:number,link:string) => void,
    activeIndex:any,
    handleChange:any,
    handleApplyUrl:(url:string)=>void,
    inputValue:RequestInfo

}

function SubHeader({handleLinkChange,activeIndex,handleChange,handleApplyUrl,inputValue}:SubHeaderProps) {
  return (
        <header
          className="
            top-0 z-1000
            mx-4 mt-4
            rounded-3xl
            border border-white/10
            bg-white/5 backdrop-blur-xl
            shadow-[0_10px_40px_rgba(0,0,0,0.35)]
          "
        >
          <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
          
            <div className="flex flex-wrap gap-2">
              {satellite_data_links.map(([label, link], i) => (
                <Button
                  key={i}
                  onClick={() => handleLinkChange(i, link)}
                  className={`
                    rounded-3xl! px-4 py-2 font-medium transition
                    border border-white/10
                    ${activeIndex === i
                      ? "bg-amber-500! text-black! shadow-[0_0_25px_rgba(245,158,11,0.35)]"
                      : "bg-white/10! text-white! hover:bg-white/15!"}
                  `}
                >
                  {label}
                </Button>
              ))}
            </div>
    
            <div className="flex flex-1 items-center justify-end gap-3 min-w-[280px]">
              <div className="relative w-full max-w-[560px]">
                <div className="pointer-events-none absolute -inset-0.5 rounded-3xl bg-linear-to-r from-amber-400/60 via-white/10 to-emerald-300/40 blur-sm" />
                <Input
                disableUnderline
                  className="
                    relative
                    w-full rounded-3xl
                    bg-white/90 text-black
                    placeholder:text-black/50
                    max-h-3
                    px-5 py-5
                    shadow-inner
                    focus-visible:ring-4 focus-visible:ring-amber-400
                  "
                  placeholder="Paste TLE URL (CelesTrak, Space-Track, etc.)"
                  onChange={handleChange}
                />
              </div>
    
              <Button
                onClick={() => handleApplyUrl(inputValue.toString())}
                className="
                  rounded-3xl! px-5 py-6 font-semibold
                  bg-linear-to-r from-amber-400 to-amber-500
                  text-black!
                  shadow-[0_10px_30px_rgba(245,158,11,0.25)]
                  hover:brightness-105 active:scale-[0.98] transition
                "
              >
                Search
              </Button>
            </div>
          </div>
        </header>
  )
}

export default SubHeader