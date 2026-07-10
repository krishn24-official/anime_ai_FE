import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { AppDispatch, RootState } from '../../store';
import {
  registerUserThunk,
  loginUserThunk,
  forgotPasswordThunk,
  verifyOtpThunk,
  resetPasswordThunk,
  clearError,
} from '../../store/slices/authSlice';
import {
  Sparkles,
  Mail,
  Lock,
  User,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
} from 'lucide-react';

const AuthPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error, currentUser, forgotPasswordEmail, forgotPasswordOtp } = useSelector(
    (state: RootState) => state.auth
  );

  const [view, setView] = useState<'login' | 'register' | 'forgot' | 'otp' | 'new-password'>('login');

  // Input states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [identifier, setIdentifier] = useState(''); // email or username for login
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Clear errors when changing views
  useEffect(() => {
    dispatch(clearError());
    setValidationError(null);
  }, [view, dispatch]);

  // If user is already logged in, redirect to home
  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  // Handle Form Submissions
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password.trim()) {
      setValidationError('All fields are required');
      return;
    }
    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return;
    }
    setValidationError(null);

    const result = await dispatch(registerUserThunk({ username, email, password }));
    if (registerUserThunk.fulfilled.match(result)) {
      // Clear fields and switch to login
      setUsername('');
      setPassword('');
      // Pre-fill the login identifier with the email
      setIdentifier(email);
      setView('login');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setValidationError('Both fields are required');
      return;
    }
    setValidationError(null);

    const result = await dispatch(loginUserThunk({ identifier, password }));
    if (loginUserThunk.fulfilled.match(result)) {
      navigate('/');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setValidationError('Email is required');
      return;
    }
    setValidationError(null);

    const result = await dispatch(forgotPasswordThunk({ email }));
    if (forgotPasswordThunk.fulfilled.match(result)) {
      setView('otp');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setValidationError('Please enter a valid 6-digit verification code');
      return;
    }
    setValidationError(null);

    // email is retrieved from the stored state
    const targetEmail = forgotPasswordEmail || email;
    const result = await dispatch(verifyOtpThunk({ email: targetEmail, otp }));
    if (verifyOtpThunk.fulfilled.match(result)) {
      setView('new-password');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }
    setValidationError(null);

    const targetEmail = forgotPasswordEmail || email;
    const targetOtp = forgotPasswordOtp || otp;

    const result = await dispatch(
      resetPasswordThunk({
        email: targetEmail,
        otp: targetOtp,
        new_password: newPassword,
        confirm_password: confirmPassword,
      })
    );

    if (resetPasswordThunk.fulfilled.match(result)) {
      // Clean up fields
      setNewPassword('');
      setConfirmPassword('');
      setOtp('');
      setView('login');
    }
  };

  return (
    <div className="min-h-screen bg-anime-bg flex items-center justify-center p-4 relative overflow-hidden font-inter">
      {/* Dynamic Cyber Background grid/glow effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2833_1px,transparent_1px),linear-gradient(to_bottom,#1f2833_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-25" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-anime-purple/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-anime-primary/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Auth Card Container */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 rounded-3xl border border-anime-border bg-anime-card/40 backdrop-blur-xl shadow-2xl relative z-10 overflow-hidden">
        
        {/* Left Side: Anime Aesthetic Promotional Section */}
        <div className="hidden md:flex md:col-span-5 flex-col justify-between p-8 bg-gradient-to-br from-anime-purple/30 via-anime-bg to-anime-primary/20 border-r border-anime-border relative">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-anime-purple via-anime-pink to-anime-primary flex items-center justify-center shadow-lg shadow-anime-primary/20">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-md font-bold font-fraunces tracking-wider text-white">ANIME AI</h2>
              <span className="text-[9px] text-anime-secondary tracking-widest block uppercase font-medium">Entertainment Hub</span>
            </div>
          </div>

          <div className="my-auto space-y-6">
            <h3 className="text-3xl font-extrabold font-fraunces text-white leading-tight">
              Unlock Your Ultimate <span className="bg-gradient-to-r from-anime-primary via-anime-pink to-anime-purple bg-clip-text text-transparent">Otaku Experience</span>
            </h3>
            <p className="text-sm text-anime-text/80 leading-relaxed">
              Join our exclusive universe to track your favorite anime events, converse with AI companions, read the latest news, and play arcade games!
            </p>
            
          </div>

          <div className="text-[10px] text-anime-text/40">
            © 2026 Anime AI. Made for anime enthusiasts.
          </div>
        </div>

        {/* Right Side: Authentication Forms */}
        <div className="col-span-1 md:col-span-7 p-8 md:p-12 flex flex-col justify-center">
          
          {/* Header Title depending on current view */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold font-fraunces text-white tracking-wide flex items-center gap-2">
              {view === 'login' && 'Welcome Back, Otaku!'}
              {view === 'register' && 'Create Your Account'}
              {view === 'forgot' && 'Reset Password Request'}
              {view === 'otp' && 'Enter Verification Code'}
              {view === 'new-password' && 'Choose New Password'}
            </h2>
            <p className="text-sm text-anime-secondary mt-1">
              {view === 'login' && 'Log in to access your digital companion and watchlist.'}
              {view === 'register' && 'Sign up to embark on your anime companion journey.'}
              {view === 'forgot' && 'Provide your registered email to receive a 6-digit OTP.'}
              {view === 'otp' && `We sent a 6-digit verification code to ${forgotPasswordEmail || email || 'your email'}.`}
              {view === 'new-password' && 'Enter your new secure password details.'}
            </p>
          </div>

          {/* Validation or API error indicators */}
          {(validationError || error) && (
            <div className="mb-6 p-4 bg-anime-pink/10 border border-anime-pink/30 rounded-2xl flex items-center space-x-3 text-anime-pink animate-shake">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">{validationError || error}</span>
            </div>
          )}

          {/* 1. REGISTER VIEW */}
          {view === 'register' && (
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-anime-text uppercase tracking-wider">Username</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="otaku_warrior"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-anime-primary/60 focus:ring-1 focus:ring-anime-primary/20 transition-all placeholder:text-anime-text/30"
                  />
                  <User className="w-4 h-4 text-anime-text/40 absolute left-4 top-4" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-anime-text uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-anime-primary/60 focus:ring-1 focus:ring-anime-primary/20 transition-all placeholder:text-anime-text/30"
                  />
                  <Mail className="w-4 h-4 text-anime-text/40 absolute left-4 top-4" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-anime-text uppercase tracking-wider">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-12 text-sm text-white focus:outline-none focus:border-anime-primary/60 focus:ring-1 focus:ring-anime-primary/20 transition-all placeholder:text-anime-text/30"
                  />
                  <Lock className="w-4 h-4 text-anime-text/40 absolute left-4 top-4" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4 text-anime-text/40 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-anime-primary to-anime-secondary text-black font-bold font-inter rounded-2xl hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer mt-4"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Register Now</span>}
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-anime-text/60">Already have an account? </span>
                <button
                  type="button"
                  onClick={() => setView('login')}
                  className="text-xs text-anime-primary font-bold hover:underline cursor-pointer"
                >
                  Log In
                </button>
              </div>
            </form>
          )}

          {/* 2. LOGIN VIEW */}
          {view === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-anime-text uppercase tracking-wider">Username or Email</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="otaku_warrior or you@example.com"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-anime-primary/60 focus:ring-1 focus:ring-anime-primary/20 transition-all placeholder:text-anime-text/30"
                  />
                  <User className="w-4 h-4 text-anime-text/40 absolute left-4 top-4" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-anime-text uppercase tracking-wider">Password</label>
                  <button
                    type="button"
                    onClick={() => setView('forgot')}
                    className="text-xs text-anime-secondary hover:text-anime-primary transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-12 text-sm text-white focus:outline-none focus:border-anime-primary/60 focus:ring-1 focus:ring-anime-primary/20 transition-all placeholder:text-anime-text/30"
                  />
                  <Lock className="w-4 h-4 text-anime-text/40 absolute left-4 top-4" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4 text-anime-text/40 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setView('register')}
                  className="w-full sm:w-1/3 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold font-inter rounded-2xl active:scale-[0.99] transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-2/3 py-4 bg-gradient-to-r from-anime-primary to-anime-secondary text-black font-bold font-inter rounded-2xl hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Login to Hub</span>}
                </button>
              </div>
            </form>
          )}

          {/* 3. FORGOT PASSWORD VIEW */}
          {view === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-anime-text uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="registered_email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-anime-primary/60 focus:ring-1 focus:ring-anime-primary/20 transition-all placeholder:text-anime-text/30"
                  />
                  <Mail className="w-4 h-4 text-anime-text/40 absolute left-4 top-4" />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setView('login')}
                  className="w-full sm:w-1/3 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold font-inter rounded-2xl active:scale-[0.99] transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-2/3 py-4 bg-gradient-to-r from-anime-primary to-anime-secondary text-black font-bold font-inter rounded-2xl hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Send OTP</span>}
                </button>
              </div>
            </form>
          )}

          {/* 4. ENTER OTP VIEW */}
          {view === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-anime-text uppercase tracking-wider">6-Digit OTP Code</label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-center text-lg tracking-[0.4em] font-bold text-white focus:outline-none focus:border-anime-primary/60 focus:ring-1 focus:ring-anime-primary/20 transition-all placeholder:text-anime-text/30"
                  />
                  <KeyRound className="w-4 h-4 text-anime-text/40 absolute left-4 top-4.5" />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setView('forgot')}
                  className="w-full sm:w-1/3 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold font-inter rounded-2xl active:scale-[0.99] transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-2/3 py-4 bg-gradient-to-r from-anime-primary to-anime-secondary text-black font-bold font-inter rounded-2xl hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Verify OTP</span>}
                </button>
              </div>
            </form>
          )}

          {/* 5. NEW PASSWORD VIEW */}
          {view === 'new-password' && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-anime-text uppercase tracking-wider">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-12 text-sm text-white focus:outline-none focus:border-anime-primary/60 focus:ring-1 focus:ring-anime-primary/20 transition-all placeholder:text-anime-text/30"
                  />
                  <Lock className="w-4 h-4 text-anime-text/40 absolute left-4 top-4" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4 text-anime-text/40 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-anime-text uppercase tracking-wider">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-12 text-sm text-white focus:outline-none focus:border-anime-primary/60 focus:ring-1 focus:ring-anime-primary/20 transition-all placeholder:text-anime-text/30"
                  />
                  <ShieldCheck className="w-4 h-4 text-anime-text/40 absolute left-4 top-4" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-anime-primary to-anime-secondary text-black font-bold font-inter rounded-2xl hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer mt-4"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Reset Password</span>}
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};

export default AuthPage;
