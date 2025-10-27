import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { fetchUserProfile } from '../../features/user/userThunk'
import { useAppDispatch } from '../../hooks/customReduxHooks'
import Loading from '../Loading/Loading'

const MSALRedirect: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  useEffect(() => {
    const run = async () => {
      await dispatch(fetchUserProfile()).unwrap()
      navigate('/')
    }

    run().catch((e) => {
      console.error('[MSALRedirect] failed:', e)
      navigate('/error')
    })
  }, [dispatch, navigate])

  return <Loading message='Processing login redirect...' />
}

export default MSALRedirect
