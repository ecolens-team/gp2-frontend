import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext/AuthContext';
import { getObservations } from '../services/observationsService';

function formatDate(timestamp: string) {
  if (!timestamp) return 'N/A';

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return 'N/A';

  return date.toLocaleDateString();
}

export default function Profile() {
  const { authUser, loading } = useAuth();
  const { data: observations = [], isLoading: observationsLoading } = useQuery({
    queryKey: ['observations'],
    queryFn: getObservations,
  });


  const myObservations = useMemo(
    () => observations.filter((observation) => observation.user === authUser?.username),
    [observations, authUser?.username]
  );

  const lastObservationDate = myObservations.length
    ? formatDate(myObservations[0].timestamp)
    : 'No observations yet';

  if (loading) {
    return (
      <div className="min-h-screen bg-teal-600/10 flex items-center justify-center">
        <p className="text-teal-700 font-semibold">Loading profile...</p>
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="min-h-screen bg-teal-600/10 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl p-6 shadow-sm text-center w-full max-w-lg">
          <h1 className="text-2xl font-bold text-teal-700">Profile</h1>
          <p className="text-gray-500 mt-2">No authenticated user found.</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-teal-600/10 flex justify-center p-5">
      <div className="w-full max-w-4xl space-y-4">
        <section className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 border-2 border-teal-600 rounded-full flex items-center justify-center text-2xl font-bold text-teal-600">
              {authUser.profile_picture? <img src={authUser.profile_picture} className='w-15 h-15 rounded-full'/> : authUser.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{authUser.first_name} {authUser.last_name}</h1>
              <p className="text-gray-500">@{authUser.username}</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-teal-50 p-3">
              <p className="text-gray-500">Role</p>
              <p className="font-semibold text-teal-700">{authUser.role} {authUser.role == 'RESEARCHER' ? `(${authUser.researcher_profile?.application_status})` : ''}</p>
            </div>
            <div className="rounded-lg bg-teal-50 p-3">
              <p className="text-gray-500">Phone Number</p>
              <p className="font-semibold text-gray-800">{authUser.phone_number || 'N/A'}</p>
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-gray-50 p-4">
            <p className="text-gray-500 text-sm">Bio</p>
            <p className="text-gray-800 mt-1">{authUser.bio || 'No bio added yet.'}</p>
          </div>
        </section>

        <section className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">Observation Activity</h2>

          {observationsLoading ? (
            <p className="text-gray-500 mt-3">Loading observation stats...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-sm">
              <div className="rounded-lg bg-teal-50 p-3">
                <p className="text-gray-500">My Observations</p>
                <p className="font-semibold text-teal-700 text-lg">{myObservations.length}</p>
              </div>
              <div className="rounded-lg bg-teal-50 p-3">
                <p className="text-gray-500">Last Observation</p>
                <p className="font-semibold text-gray-800">{lastObservationDate}</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}