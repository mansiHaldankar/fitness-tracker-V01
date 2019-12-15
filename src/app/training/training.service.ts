import { Subject } from 'rxjs/Subject';
import { map } from 'rxjs/operators';
import { AngularFirestore, AngularFirestoreModule } from 'angularfire2/firestore';

import { Exercise } from './exercise.model';
import { Injectable } from '@angular/core';

@Injectable()

export class TrainingService {
  exerciseChanged = new Subject<Exercise>();
  exercisesChanged = new Subject<Exercise[]>();
  FinishedExercisesChanged = new Subject<Exercise[]>();
  private availableExercises: Exercise[] = [];
  private runningExercise: Exercise;
  private exercises: Exercise[] = [];

   constructor(private db : AngularFirestore){}
  
   /*getAvailableExercises(){
    return this.availableExercises.slice();
   }*/

  fetchAvailableExercises() {
    this.db.collection<Exercise>('availableExercises')
        .snapshotChanges() 
        .pipe(
          map(docArray => docArray.map(doc => {
            const data = doc.payload.doc.data();
            const id = doc.payload.doc.id;
            return {id, ...data};
          }))
        ).subscribe((exercises : Exercise[]) => {
            this.availableExercises = exercises;
            this.exercisesChanged.next([...this.availableExercises]);
        });
  }

  startExercise(selectedId: string) {
    this.runningExercise = this.availableExercises.find(
      ex => ex.id === selectedId
    );
    this.exerciseChanged.next({ ...this.runningExercise });
  }

  completeExercise() {
    this.addDataToDatabase({
      ...this.runningExercise,
      date: new Date(),
      state: 'completed'
    });
    this.runningExercise = null;
    this.exerciseChanged.next(null);
  }

  cancelExercise(progress: number) {
    this.addDataToDatabase({
      ...this.runningExercise,
      duration: this.runningExercise.duration * (progress / 100),
      calories: this.runningExercise.calories * (progress / 100),
      date: new Date(),
      state: 'cancelled'
    });
    this.runningExercise = null;
    this.exerciseChanged.next(null);
  }

  getRunningExercise() {
    return { ...this.runningExercise };
  }

  /*getCompletedOrCancelledExercises() {
    return this.exercises.slice();
  }*/

  fetchCompletedOrCancelledExercises() {
    this.db.collection<Exercise>('finishedExercises').valueChanges().subscribe((exercises : Exercise[]) =>{
      this.FinishedExercisesChanged.next(exercises);
    })
  }

  private addDataToDatabase(exercise : Exercise){
    this.db.collection('finishedExercises').add(exercise);
  }
}
