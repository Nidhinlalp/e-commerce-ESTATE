import { useSelector } from 'react-redux';
import { useRef, useState, useEffect } from 'react';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../firebase';

export default function Profile() {
  const fileRef = useRef(null);

  const [file, setFile] = useState(undefined);
  const [parentageOfImageUpload, setPercentageOfImageUpload] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  console.log(parentageOfImageUpload);
  console.log(formData);

  //firebase storage rule

  //  allow read;
  // allow write: if
  // request.resource.size < 2 * 1024 *1024 &&
  // request.resource.contentType.mathces('image/.*')

  const handleFileUpload = (file) => {
    const storage = getStorage(app);

    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setPercentageOfImageUpload(Math.round(progress));
        console.log('Upload is ' + progress + '% done');
      },
      (error) => {
        setFileUploadError(true);
        console.log(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) =>
          setFormData({ ...formData, avatar: downloadURL })
        );
      }
    );
  };
  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const { currentUser } = useSelector((state) => state.user);
  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-bold text-center my-7'>Profile</h1>
      <form className='flex justify-center flex-col'>
        <input
          onChange={(e) => setFile(e.target.files[0])}
          ref={fileRef}
          type='file'
          accept='image/*'
          className='hidden'
        />
        <img
          onClick={() => fileRef.current.click()}
          src={formData.avatar || currentUser?.avatar}
          alt='profile'
          className='rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2'
        />

        <p className='text-sm self-center'>
          {fileUploadError ? (
            <span className='text-red-700 '>Error Image Uploading</span>
          ) : parentageOfImageUpload > 0 && parentageOfImageUpload < 100 ? (
            <span className='text-slate-700'>{`Uploading ${parentageOfImageUpload}%`}</span>
          ) : parentageOfImageUpload === 100 ? (
            <span className='text-green-700'>Image Successfully Uploaded</span>
          ) : null}
        </p>

        <input
          type='text'
          id='username'
          value={currentUser?.username}
          placeholder='Name'
          className='border border-gray-300 rounded-md p-2 my-2'
        />
        <input
          type='text'
          id='email'
          value={currentUser?.email}
          placeholder='Email'
          className='border border-gray-300 rounded-md p-2 my-2'
        />
        <input
          type='text'
          id='password'
          placeholder='Password'
          className='border border-gray-300 rounded-md p-2 my-2'
        />
        <button className='bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80'>
          Update
        </button>

        <div className='flex justify-between mt-2'>
          <span className='text-red-700 cursor-pointer'>Delete Account</span>
          <span className='text-red-700 cursor-pointer'>Sign Out</span>
        </div>
      </form>
    </div>
  );
}
