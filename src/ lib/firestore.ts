import {
    collection, addDoc, getDocs, query, orderBy,
    serverTimestamp, doc, updateDoc, deleteDoc,
  } from 'firebase/firestore';
  import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
  import { db, storage } from '../firebase';
  import { mapFirestoreDoc } from './helpers';
  import type { Prospect, MeasurementPhoto } from '../types';
  
  // =========================================================
  // LIB — Capa Firestore + Storage
  // =========================================================
  
  export const uploadBase64Photo = async (base64: string, path: string): Promise<string> => {
    const blob = await (await fetch(base64)).blob();
    const photoRef = ref(storage, path);
    await uploadBytes(photoRef, blob);
    return await getDownloadURL(photoRef);
  };
  
  export const fetchAllProspects = async (): Promise<Prospect[]> => {
    const q = query(collection(db, 'prospects'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(mapFirestoreDoc);
  };
  
  export const createProspect = async (formData: any): Promise<string> => {
    let photoURL: string | null = null;
    if (formData.photo && typeof formData.photo === 'string' && formData.photo.startsWith('data:')) {
      const safeName = (formData.name || 'prospect').replace(/\s+/g, '-');
      photoURL = await uploadBase64Photo(formData.photo, `prospect-photos/${Date.now()}-${safeName}.jpg`);
    }
    const { photo, ...rest } = formData;
    const payload = { ...rest, photoURL, measurementPhotos: [], createdAt: serverTimestamp() };
    const docRef = await addDoc(collection(db, 'prospects'), payload);
    return docRef.id;
  };
  
  export const updateProspect = async (id: string, formData: any): Promise<void> => {
    let photoURL: string | null = null;
    if (formData.photo && typeof formData.photo === 'string') {
      if (formData.photo.startsWith('data:')) {
        const safeName = (formData.name || 'prospect').replace(/\s+/g, '-');
        photoURL = await uploadBase64Photo(formData.photo, `prospect-photos/${Date.now()}-${safeName}.jpg`);
      } else {
        photoURL = formData.photo;
      }
    }
    const { photo, ...rest } = formData;
    const payload = { ...rest, photoURL, updatedAt: serverTimestamp() };
    await updateDoc(doc(db, 'prospects', id), payload);
  };
  
  export const deleteProspect = async (id: string): Promise<void> => {
    await deleteDoc(doc(db, 'prospects', id));
  };
  
  export const addMeasurementPhoto = async (
    prospectId: string,
    photoBase64: string,
    category: string,
    notes: string,
    currentPhotos: MeasurementPhoto[]
  ): Promise<MeasurementPhoto[]> => {
    const url = await uploadBase64Photo(
      photoBase64,
      `measurement-photos/${prospectId}/${Date.now()}.jpg`
    );
    const newPhoto: MeasurementPhoto = {
      url,
      category,
      notes: notes || '',
      uploadedAt: Date.now(),
    };
    const updatedPhotos = [...currentPhotos, newPhoto];
    await updateDoc(doc(db, 'prospects', prospectId), { measurementPhotos: updatedPhotos });
    return updatedPhotos;
  };
  
  export const deleteMeasurementPhoto = async (
    prospectId: string,
    photoToDelete: MeasurementPhoto,
    currentPhotos: MeasurementPhoto[]
  ): Promise<MeasurementPhoto[]> => {
    try {
      const photoPath = decodeURIComponent(
        new URL(photoToDelete.url).pathname.split('/o/')[1].split('?')[0]
      );
      await deleteObject(ref(storage, photoPath));
    } catch (e) {
      /* ignorable */
    }
    const updatedPhotos = currentPhotos.filter((p) => p.url !== photoToDelete.url);
    await updateDoc(doc(db, 'prospects', prospectId), { measurementPhotos: updatedPhotos });
    return updatedPhotos;
  };