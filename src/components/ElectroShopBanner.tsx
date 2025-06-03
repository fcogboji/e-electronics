'use client';

import Link from 'next/link';

export default function ElectroShopBanner() {
  return (
    <Link href="/promo" className="block">
      <div className="banner">
        {/* Lightning Flash Effect */}
        <div className="lightning-flash"></div>
        
        {/* Speed Lines */}
        <div className="speed-line"></div>
        <div className="speed-line"></div>
        <div className="speed-line"></div>
        
        {/* Particles */}
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        
        {/* Scene 1: Logo Intro */}
        <div className="scene-1">
          <div className="logo-intro">ElectroShop</div>
        </div>
        
        {/* Scene 2: Sale Announcement */}
        <div className="scene-2">
          <div className="sale-explosion">MEGA SALE!</div>
        </div>
        
        {/* Scene 3: Product Icons */}
        <div className="scene-3">
          <div className="product-icon">📱</div>
          <div className="product-icon">💻</div>
          <div className="product-icon">🎧</div>
          <div className="product-icon">⌚</div>
        </div>
        
        {/* Countdown Timer */}
        <div className="countdown">24:59:30</div>
        
        {/* Discount Badge */}
        <div className="discount-badge">70% OFF</div>
        
        {/* Styles */}
        <style jsx>{`
          .banner {
            width: 100%;
            height: 150px;
            background: linear-gradient(45deg, #FFD700, #FFF700, #FFED4E, #FFFFFF);
            background-size: 400% 400%;
            animation: gradientShift 1s ease-in-out infinite;
            position: relative;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 20px rgba(255, 215, 0, 0.3);
            cursor: pointer;
            transition: transform 0.2s ease;
          }

          .banner:hover {
            transform: scale(1.02);
          }

          @keyframes gradientShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }

          /* Scene 1: Logo Intro */
          .scene-1 {
            position: absolute;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: scene1Timeline 6s infinite;
          }

          .logo-intro {
            font-size: 4rem;
            font-weight: 900;
            color: #1a1a1a;
            text-shadow: 3px 3px 6px rgba(0,0,0,0.4);
            transform: scale(0);
            animation: logoIntro 6s infinite;
          }

          @keyframes logoIntro {
            0% { transform: scale(0) rotate(-180deg); opacity: 0; }
            8% { transform: scale(1.2) rotate(0deg); opacity: 1; }
            25% { transform: scale(1) rotate(0deg); opacity: 1; }
            33% { transform: scale(0) rotate(180deg); opacity: 0; }
            100% { transform: scale(0) rotate(180deg); opacity: 0; }
          }

          /* Scene 2: Sale Explosion */
          .scene-2 {
            position: absolute;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: scene2Timeline 6s infinite;
          }

          .sale-explosion {
            font-size: 3.5rem;
            font-weight: 900;
            color: #FF6B35;
            text-shadow: 0 0 20px rgba(255, 107, 53, 0.8);
            transform: scale(0);
            animation: saleExplosion 6s infinite;
          }

          @keyframes saleExplosion {
            0%, 33% { transform: scale(0); opacity: 0; }
            41% { transform: scale(1.5); opacity: 1; }
            58% { transform: scale(1); opacity: 1; }
            66% { transform: scale(0); opacity: 0; }
            100% { transform: scale(0); opacity: 0; }
          }

          /* Scene 3: Products Flash */
          .scene-3 {
            position: absolute;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: space-around;
            animation: scene3Timeline 6s infinite;
          }

          .product-icon {
            font-size: 3rem;
            opacity: 0;
            transform: translateY(50px);
            animation: productFlash 6s infinite;
          }

          .product-icon:nth-child(1) { animation-delay: 0s; }
          .product-icon:nth-child(2) { animation-delay: 0.1s; }
          .product-icon:nth-child(3) { animation-delay: 0.2s; }
          .product-icon:nth-child(4) { animation-delay: 0.3s; }

          @keyframes productFlash {
            0%, 66% { transform: translateY(50px); opacity: 0; }
            74% { transform: translateY(0); opacity: 1; }
            91% { transform: translateY(0); opacity: 1; }
            99% { transform: translateY(-50px); opacity: 0; }
            100% { transform: translateY(50px); opacity: 0; }
          }

          /* Lightning Effects */
          .lightning-flash {
            position: absolute;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.9);
            opacity: 0;
            animation: lightningFlash 6s infinite;
          }

          @keyframes lightningFlash {
            32%, 65%, 98% { opacity: 0; }
            33%, 40%, 66%, 73%, 99% { opacity: 1; }
          }

          /* Particle Burst */
          .particle {
            position: absolute;
            width: 6px;
            height: 6px;
            background: radial-gradient(circle, #FFD700, #FF6B35);
            border-radius: 50%;
            animation: particleBurst 6s infinite;
          }

          .particle:nth-child(1) { left: 20%; top: 30%; animation-delay: 0s; }
          .particle:nth-child(2) { right: 20%; top: 25%; animation-delay: 0.1s; }
          .particle:nth-child(3) { left: 30%; bottom: 30%; animation-delay: 0.2s; }
          .particle:nth-child(4) { right: 30%; bottom: 25%; animation-delay: 0.3s; }
          .particle:nth-child(5) { left: 50%; top: 20%; animation-delay: 0.4s; }

          @keyframes particleBurst {
            0%, 40% { transform: scale(0) rotate(0deg); opacity: 0; }
            42% { transform: scale(2) rotate(180deg); opacity: 1; }
            64% { transform: scale(0.5) rotate(360deg); opacity: 1; }
            66% { transform: scale(0) rotate(540deg); opacity: 0; }
            100% { transform: scale(0) rotate(540deg); opacity: 0; }
          }

          /* Countdown Timer */
          .countdown {
            position: absolute;
            top: 20px;
            right: 20px;
            font-size: 1.5rem;
            font-weight: bold;
            color: #FF6B35;
            background: rgba(255, 255, 255, 0.9);
            padding: 5px 10px;
            border-radius: 20px;
            animation: countdownFlash 6s infinite;
          }

          @keyframes countdownFlash {
            0%, 33%, 66% { opacity: 0; transform: scale(0); }
            8%, 25%, 41%, 58%, 74%, 91% { opacity: 1; transform: scale(1); }
            32%, 65%, 98% { opacity: 0; transform: scale(1.2); }
          }

          /* Discount Badge */
          .discount-badge {
            position: absolute;
            bottom: 20px;
            left: 20px;
            font-size: 1.8rem;
            font-weight: 900;
            color: white;
            background: linear-gradient(45deg, #FF6B35, #FF8E53);
            padding: 10px 20px;
            border-radius: 30px;
            transform: rotate(-15deg);
            animation: discountPop 6s infinite;
            box-shadow: 0 4px 20px rgba(255, 107, 53, 0.5);
          }

          @keyframes discountPop {
            0%, 74% { transform: rotate(-15deg) scale(0); opacity: 0; }
            82% { transform: rotate(-15deg) scale(1.3); opacity: 1; }
            91% { transform: rotate(-15deg) scale(1); opacity: 1; }
            99% { transform: rotate(-15deg) scale(0); opacity: 0; }
            100% { transform: rotate(-15deg) scale(0); opacity: 0; }
          }

          /* Speed Lines */
          .speed-line {
            position: absolute;
            height: 2px;
            background: linear-gradient(90deg, transparent, #FFD700, transparent);
            animation: speedLine 6s infinite;
          }

          .speed-line:nth-child(1) { top: 30%; width: 100%; animation-delay: 0.5s; }
          .speed-line:nth-child(2) { top: 50%; width: 80%; left: 20%; animation-delay: 0.7s; }
          .speed-line:nth-child(3) { top: 70%; width: 100%; animation-delay: 0.9s; }

          @keyframes speedLine {
            0%, 30% { transform: translateX(-100%); opacity: 0; }
            32% { transform: translateX(-100%); opacity: 1; }
            35% { transform: translateX(100%); opacity: 1; }
            37%, 100% { transform: translateX(100%); opacity: 0; }
          }

          /* Responsive */
          @media (max-width: 768px) {
            .banner { height: 120px; }
            .logo-intro { font-size: 3rem; }
            .sale-explosion { font-size: 2.5rem; }
            .product-icon { font-size: 2rem; }
            .countdown { font-size: 1.2rem; }
            .discount-badge { font-size: 1.4rem; padding: 8px 16px; }
          }

          @media (max-width: 480px) {
            .banner { height: 100px; }
            .logo-intro { font-size: 2.2rem; }
            .sale-explosion { font-size: 2rem; }
            .product-icon { font-size: 1.5rem; }
            .countdown { font-size: 1rem; top: 10px; right: 10px; }
            .discount-badge { font-size: 1.2rem; bottom: 10px; left: 10px; }
          }
        `}</style>
      </div>
    </Link>
  );
}