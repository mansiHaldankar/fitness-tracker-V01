import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AngularFirestore } from 'angularfire2/firestore';

import { TrainingService } from '../training.service';
import { Exercise } from '../exercise.model';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-new-training',
  templateUrl: './new-training.component.html',
  styleUrls: ['./new-training.component.css']
})
export class NewTrainingComponent implements OnInit, OnDestroy {
  exercises: Exercise[];
  exerciseSubscription : Subscription;

  constructor(private trainingService: TrainingService,
    private db : AngularFirestore
    ) { }

  ngOnInit() {
    // this.exercises = this.db.collection('availableExercises').valueChanges() // access only data
    this.exerciseSubscription = this.trainingService.exercisesChanged.subscribe(exercises => this.exercises = exercises);
    this.trainingService.fetchAvailableExercises();
   
  }
  ngOnDestroy(){
    this.exerciseSubscription.unsubscribe();
  }
  onStartTraining(form: NgForm) {
    this.trainingService.startExercise(form.value.exercise);
  }

}
