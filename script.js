/**
 * script.js for NeuralPath
 * Implements smooth scroll animations, waitlist form logic, and vanilla JS canvas particles
 */

document.addEventListener("DOMContentLoaded", () => {
    
    // ===== 1. Intersection Observer for Fade-In Animations =====
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Optional: Stop observing once faded in to improve performance
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in-section').forEach(section => {
        observer.observe(section);
    });

    // ===== 2. Waitlist Form Submission (Supabase) =====
    const form = document.getElementById('waitlistForm');
    const emailInput = document.getElementById('emailInput');
    const formMessage = document.getElementById('formMessage');
    const submitBtn = document.getElementById('submitBtn');

    // Initialize Supabase Client
    const supabaseUrl = 'https://vkfgiwectmpvrurupkpg.supabase.co';
    const supabaseKey = 'sb_publishable_e8q5x4eEG_MB4LnVW_xC1w_UQcIHqKH'; 
    const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = emailInput.value.trim();
            
            if (email) {
                submitBtn.textContent = 'Joining...';
                submitBtn.disabled = true;
                formMessage.textContent = '';

                try {
                    // Try to insert the email into the Supabase 'waitlist' table
                    const { data, error } = await supabaseClient
                        .from('waitlist')
                        .insert([{ email: email }]);

                    if (error) {
                        // Check if error is due to duplicate email
                        if (error.code === '23505' || error.message.toLowerCase().includes('duplicate')) {
                            throw new Error("You are already on the waitlist!");
                        }
                        throw error;
                    }

                    // Success State
                    formMessage.style.color = 'var(--blue)';
                    formMessage.style.textShadow = '0 0 10px rgba(0, 198, 255, 0.8)'; // Glowing electric blue
                    formMessage.textContent = "You're on the list! We'll be in touch soon.";
                    emailInput.value = '';
                } catch (err) {
                    // Error State
                    formMessage.style.color = '#ff4d4d'; // Red error
                    formMessage.style.textShadow = '0 0 10px rgba(255, 77, 77, 0.8)';
                    formMessage.textContent = err.message || "An error occurred. Please try again.";
                } finally {
                    submitBtn.textContent = 'Submit';
                    submitBtn.disabled = false;
                    
                    // Clear the message after 5 seconds
                    setTimeout(() => {
                        formMessage.textContent = '';
                        formMessage.style.textShadow = 'none';
                    }, 5000);
                }
            }
        });
    }

    // ===== 3. Subtle Animated Particle Background (Neural Net Effect) =====
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    let particles = [];
    // Adjust particle count depending on device screen size for performance
    const particleCount = window.innerWidth < 768 ? 35 : 70; 
    
    function resizeCanvas() {
        // Set canvas to full inner dimension
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // Initial call
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            // Very slow, subtle drift
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.radius = Math.random() * 1.5 + 0.5;
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            
            // Bounce off edges smoothly
            if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
            if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 198, 255, 0.4)';
            ctx.fill();
        }
    }
    
    // Initialize Particles
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    function animate() {
        // Clear canvas with transparency for trail effect (optional, here we fully clear)
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
            
            // Draw connecting lines if particles are close enough
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Neural connection distance threshold
                if (distance < 130) {
                    ctx.beginPath();
                    // Fade stroke opacity based on distance
                    const opacity = 0.12 - (distance / 130) * 0.12;
                    // Using violet and blue colors for lines
                    ctx.strokeStyle = `rgba(123, 47, 255, ${opacity})`;
                    ctx.lineWidth = 1;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    // Start animation loop
    animate();

    // ===== 4. Seamless Video Crossfade =====
    const video1 = document.getElementById('hero-vid-1');
    const video2 = document.getElementById('hero-vid-2');
    
    if (video1 && video2) {
        let activeVideo = video1;
        let inactiveVideo = video2;
        
        const crossfadeDuration = 1.2; // 1.2 second crossfade
        let isCrossfading = false;
        
        function checkVideoTime() {
            if (!activeVideo.duration) {
                requestAnimationFrame(checkVideoTime);
                return;
            }
            
            const timeRemaining = activeVideo.duration - activeVideo.currentTime;
            
            // Trigger crossfade just before the video ends
            // The loop attribute stays on, but we manually play over it
            if (timeRemaining <= crossfadeDuration && !isCrossfading) {
                isCrossfading = true;
                
                inactiveVideo.currentTime = 0;
                inactiveVideo.play();
                
                inactiveVideo.classList.remove('inactive');
                activeVideo.classList.add('inactive');
                
                setTimeout(() => {
                    const temp = activeVideo;
                    activeVideo = inactiveVideo;
                    inactiveVideo = temp;
                    
                    isCrossfading = false;
                }, crossfadeDuration * 1000);
            }
            
            requestAnimationFrame(checkVideoTime);
        }
        
        requestAnimationFrame(checkVideoTime);
    }
});
