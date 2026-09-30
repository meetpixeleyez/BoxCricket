"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Swords, 
  Trophy, 
  Users, 
  Plus, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle, 
  X, 
  Check, 
  Sparkles,
  Phone,
  Flame,
  Award,
  ChevronRight
} from 'lucide-react';
import { Challenge, Team } from '@/types';

export default function TeamsChallengesPage() {
  const { 
    currentUser, 
    teams, 
    createTeam, 
    challenges, 
    createChallenge, 
    respondChallenge, 
    submitMatchScore,
    grounds, 
    t 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'CHALLENGES' | 'LEADERBOARD' | 'MY_TEAM'>('CHALLENGES');
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [showChallengeModal, setShowChallengeModal] = useState<Team | null>(null);
  const [showScoreModal, setShowScoreModal] = useState<Challenge | null>(null);

  // Form: Create Team
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamArea, setNewTeamArea] = useState('Mota Varachha');
  const [member1Name, setMember1Name] = useState('');
  const [member1Phone, setMember1Phone] = useState('');

  // Form: Challenge
  const [challengeDate, setChallengeDate] = useState(new Date().toISOString().split('T')[0]);
  const [challengeTime, setChallengeTime] = useState('09:00 PM');
  const [challengeOvers, setChallengeOvers] = useState(8);
  const [challengeGround, setChallengeGround] = useState('Kings Box Cricket Arena');

  // Form: Scorecard
  const [scoreA, setScoreA] = useState('68/4 (8.0 ov)');
  const [scoreB, setScoreB] = useState('64/6 (8.0 ov)');
  const [winnerTeamId, setWinnerTeamId] = useState('');

  const myTeam = teams.find(t => t.captainId === currentUser.id || t.members.some(m => m.userId === currentUser.id));

  const handleCreateTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    createTeam({
      name: newTeamName.trim(),
      city: 'Surat',
      area: newTeamArea,
      members: [
        { userId: currentUser.id, name: currentUser.name, phone: currentUser.phone, role: currentUser.playingRole || 'ALL_ROUNDER' },
        ...(member1Name.trim() ? [{ userId: `u_${Date.now()}`, name: member1Name.trim(), phone: member1Phone || '9825000000', role: 'BATSMAN' as const }] : [])
      ]
    });

    setShowCreateTeamModal(false);
    setNewTeamName('');
    setActiveTab('MY_TEAM');
  };

  const handleSendChallenge = () => {
    if (!showChallengeModal || !myTeam) return;

    createChallenge({
      fromTeamId: myTeam.id,
      fromTeamName: myTeam.name,
      toTeamId: showChallengeModal.id,
      toTeamName: showChallengeModal.name,
      toCaptainName: showChallengeModal.captainName,
      toCaptainPhone: showChallengeModal.captainPhone,
      date: challengeDate,
      time: challengeTime,
      overs: challengeOvers,
      groundName: challengeGround,
    });

    setShowChallengeModal(null);
    setActiveTab('CHALLENGES');
  };

  const handleSubmitScorecard = () => {
    if (!showScoreModal || !winnerTeamId) return;
    submitMatchScore(showScoreModal.id, winnerTeamId, scoreA, scoreB);
    setShowScoreModal(null);
  };

  return (
    <div className="p-4 space-y-4 pb-24">
      
      {/* 1. Header Banner */}
      <div className="p-4 rounded-3xl bg-[#065f46] text-white shadow-md space-y-2 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-200 flex items-center space-x-1">
            <Flame className="w-3.5 h-3.5 text-[#ff6813]" />
            <span>Surat Box League 2026</span>
          </span>
          <button
            onClick={() => setShowCreateTeamModal(true)}
            className="px-3 py-1 rounded-xl bg-white text-emerald-800 text-[11px] font-bold shadow-sm"
          >
            + Create Team
          </button>
        </div>

        <h1 className="text-base font-black leading-tight">Teams & Match Challenges</h1>
        <p className="text-[11px] text-emerald-100/90 leading-tight">
          Challenge local Surat cricket clubs, record scorecards and climb the leaderboard!
        </p>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-200/70 rounded-2xl">
        <button
          onClick={() => setActiveTab('CHALLENGES')}
          className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 ${
            activeTab === 'CHALLENGES'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Swords className="w-3.5 h-3.5" />
          <span>Challenges</span>
        </button>

        <button
          onClick={() => setActiveTab('LEADERBOARD')}
          className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 ${
            activeTab === 'LEADERBOARD'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Trophy className="w-3.5 h-3.5 text-amber-500" />
          <span>Leaderboard</span>
        </button>

        <button
          onClick={() => setActiveTab('MY_TEAM')}
          className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 ${
            activeTab === 'MY_TEAM'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-blue-600" />
          <span>My Squad</span>
        </button>
      </div>

      {/* Tab: CHALLENGES */}
      {activeTab === 'CHALLENGES' && (
        <div className="space-y-3">
          
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Surat Box Teams Ready to Play
            </h3>
            <span className="text-[10px] text-slate-400 font-bold">{teams.length} Teams</span>
          </div>

          {teams.map((team) => {
            const isMyOwnTeam = team.captainId === currentUser.id;
            return (
              <div key={team.id} className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-xl font-bold border border-slate-200">
                      🏏
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">{team.name}</h4>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Captain: {team.captainName} • {team.area}
                      </div>
                      <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-700 mt-1">
                        <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {team.matchesWon} Won / {team.matchesPlayed} Matches
                        </span>
                        <span>{team.members.length} Squad Members</span>
                      </div>
                    </div>
                  </div>
                </div>

                {!isMyOwnTeam && (
                  <button
                    onClick={() => {
                      if (!myTeam) {
                        alert('Please register your team first before challenging rival squads!');
                        setShowCreateTeamModal(true);
                      } else {
                        setShowChallengeModal(team);
                      }
                    }}
                    className="w-full py-2.5 stitch-btn-orange text-xs flex items-center justify-center space-x-1.5"
                  >
                    <Swords className="w-3.5 h-3.5" />
                    <span>Challenge this Team</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tab: LEADERBOARD */}
      {activeTab === 'LEADERBOARD' && (
        <div className="space-y-3">
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-bold flex items-center space-x-2">
            <Trophy className="w-4 h-4 text-amber-600" />
            <span>Surat City Ranked Teams Leaderboard</span>
          </div>

          <div className="rounded-3xl bg-white border border-slate-200 divide-y divide-slate-100 shadow-sm overflow-hidden text-xs">
            {teams.sort((a,b) => b.matchesWon - a.matchesWon).map((team, idx) => (
              <div key={team.id} className="p-3.5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[11px] ${
                    idx === 0 ? 'bg-amber-400 text-slate-950 shadow-sm' : idx === 1 ? 'bg-slate-300 text-slate-900' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{team.name}</div>
                    <div className="text-[10px] text-slate-400">{team.area}, Surat</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-black text-emerald-800">{team.matchesWon} Wins</div>
                  <div className="text-[10px] text-slate-400">{team.matchesPlayed} Played</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: MY SQUAD */}
      {activeTab === 'MY_TEAM' && (
        <div className="space-y-4">
          {myTeam ? (
            <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    My Registered Team
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-1">{myTeam.name}</h3>
                  <p className="text-xs text-slate-500">Based in {myTeam.area}, Surat</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-xl">
                  🛡️
                </div>
              </div>

              <div>
                <h4 className="text-xs font-black text-slate-900 mb-2">Squad Members ({myTeam.members.length})</h4>
                <div className="space-y-1.5">
                  {myTeam.members.map((m, idx) => (
                    <div key={m.userId || idx} className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{m.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                        {m.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-3xl bg-white border border-slate-200 text-center shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto text-xl">
                🏏
              </div>
              <h3 className="text-sm font-black text-slate-900">No Team Registered Yet</h3>
              <p className="text-xs text-slate-500">
                Register your local team to challenge other boxes and play in local tournaments.
              </p>
              <button
                onClick={() => setShowCreateTeamModal(true)}
                className="px-5 py-3 stitch-btn-orange text-xs"
              >
                + Register My Team
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal: Create Team */}
      {showCreateTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">Register New Team</h3>
              <button onClick={() => setShowCreateTeamModal(false)} className="p-1 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTeamSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Team Name</label>
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="e.g. Varachha Blasters"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Home Area</label>
                <select
                  value={newTeamArea}
                  onChange={(e) => setNewTeamArea(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                >
                  {['Mota Varachha', 'Adajan', 'Vesu', 'Katargam', 'Pal'].map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 stitch-btn-orange text-xs flex items-center justify-center space-x-1.5"
              >
                <span>Create & Register</span>
                <Check className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Challenge Team */}
      {showChallengeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">Send Match Challenge</h3>
                <p className="text-[10px] text-slate-500">To: {showChallengeModal.name}</p>
              </div>
              <button onClick={() => setShowChallengeModal(null)} className="p-1 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-900 mb-1">Match Date</label>
                <input
                  type="date"
                  value={challengeDate}
                  onChange={(e) => setChallengeDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-900 mb-1">Proposed Time Slot</label>
                <input
                  type="text"
                  value={challengeTime}
                  onChange={(e) => setChallengeTime(e.target.value)}
                  placeholder="09:00 PM"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-900 mb-1">Venue / Ground</label>
                <input
                  type="text"
                  value={challengeGround}
                  onChange={(e) => setChallengeGround(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900"
                />
              </div>

              <button
                onClick={handleSendChallenge}
                className="w-full py-3.5 stitch-btn-orange text-xs flex items-center justify-center space-x-1.5"
              >
                <Swords className="w-4 h-4" />
                <span>Send Formal Challenge</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
