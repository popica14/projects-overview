import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as moment from 'moment';
import { DATE_TIME_FORMAT } from 'app/shared/constants/input.constants';
import { JhiDataUtils, JhiFileLoadError, JhiEventManager, JhiEventWithContent } from 'ng-jhipster';

import { IAstridProject, AstridProject } from 'app/shared/model/astrid-project.model';
import { AstridProjectService } from './astrid-project.service';
import { AlertError } from 'app/shared/alert/alert-error.model';
import { IEntityCreation } from 'app/shared/model/entity-creation.model';
import { EntityCreationService } from 'app/entities/entity-creation/entity-creation.service';
import { IEntityLastModification } from 'app/shared/model/entity-last-modification.model';
import { EntityLastModificationService } from 'app/entities/entity-last-modification/entity-last-modification.service';
import { IUser } from 'app/core/user/user.model';
import { UserService } from 'app/core/user/user.service';
import { IProjectStatus } from 'app/shared/model/project-status.model';
import { ProjectStatusService } from 'app/entities/project-status/project-status.service';
import { ILocation } from 'app/shared/model/location.model';
import { LocationService } from 'app/entities/location/location.service';
import { IBeneficiary } from 'app/shared/model/beneficiary.model';
import { BeneficiaryService } from 'app/entities/beneficiary/beneficiary.service';

type SelectableEntity = IEntityCreation | IEntityLastModification | IUser | IProjectStatus | ILocation | IBeneficiary;

type SelectableManyToManyEntity = IUser | IBeneficiary;

@Component({
  selector: 'jhi-astrid-project-update',
  templateUrl: './astrid-project-update.component.html',
})
export class AstridProjectUpdateComponent implements OnInit {
  isSaving = false;
  entitycreations: IEntityCreation[] = [];
  entitylastmodifications: IEntityLastModification[] = [];
  users: IUser[] = [];
  projectstatuses: IProjectStatus[] = [];
  locations: ILocation[] = [];
  beneficiaries: IBeneficiary[] = [];

  editForm = this.fb.group({
    id: [],
    name: [null, [Validators.required]],
    shortDescription: [null, [Validators.required]],
    documentation: [],
    documentationContentType: [],
    neededAmount: [],
    currentAmount: [],
    currency: [],
    supporters: [],
    goal: [],
    statusReason: [],
    statusDeadline: [],
    entityCreationId: [],
    entityLastModificationId: [],
    responsibleId: [null, Validators.required],
    statusId: [],
    locationId: [],
    implementationTeams: [],
    beneficiaries: [],
  });

  constructor(
    protected dataUtils: JhiDataUtils,
    protected eventManager: JhiEventManager,
    protected astridProjectService: AstridProjectService,
    protected entityCreationService: EntityCreationService,
    protected entityLastModificationService: EntityLastModificationService,
    protected userService: UserService,
    protected projectStatusService: ProjectStatusService,
    protected locationService: LocationService,
    protected beneficiaryService: BeneficiaryService,
    protected activatedRoute: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ astridProject }) => {
      if (!astridProject.id) {
        const today = moment().startOf('day');
        astridProject.statusDeadline = today;
      }

      this.updateForm(astridProject);

      this.entityCreationService
        .query({ filter: 'astridproject-is-null' })
        .pipe(
          map((res: HttpResponse<IEntityCreation[]>) => {
            return res.body || [];
          })
        )
        .subscribe((resBody: IEntityCreation[]) => {
          if (!astridProject.entityCreationId) {
            this.entitycreations = resBody;
          } else {
            this.entityCreationService
              .find(astridProject.entityCreationId)
              .pipe(
                map((subRes: HttpResponse<IEntityCreation>) => {
                  return subRes.body ? [subRes.body].concat(resBody) : resBody;
                })
              )
              .subscribe((concatRes: IEntityCreation[]) => (this.entitycreations = concatRes));
          }
        });

      this.entityLastModificationService
        .query({ filter: 'astridproject-is-null' })
        .pipe(
          map((res: HttpResponse<IEntityLastModification[]>) => {
            return res.body || [];
          })
        )
        .subscribe((resBody: IEntityLastModification[]) => {
          if (!astridProject.entityLastModificationId) {
            this.entitylastmodifications = resBody;
          } else {
            this.entityLastModificationService
              .find(astridProject.entityLastModificationId)
              .pipe(
                map((subRes: HttpResponse<IEntityLastModification>) => {
                  return subRes.body ? [subRes.body].concat(resBody) : resBody;
                })
              )
              .subscribe((concatRes: IEntityLastModification[]) => (this.entitylastmodifications = concatRes));
          }
        });

      this.userService.query().subscribe((res: HttpResponse<IUser[]>) => (this.users = res.body || []));

      this.projectStatusService.query().subscribe((res: HttpResponse<IProjectStatus[]>) => (this.projectstatuses = res.body || []));

      this.locationService.query().subscribe((res: HttpResponse<ILocation[]>) => (this.locations = res.body || []));

      this.beneficiaryService.query().subscribe((res: HttpResponse<IBeneficiary[]>) => (this.beneficiaries = res.body || []));
    });
  }

  updateForm(astridProject: IAstridProject): void {
    this.editForm.patchValue({
      id: astridProject.id,
      name: astridProject.name,
      shortDescription: astridProject.shortDescription,
      documentation: astridProject.documentation,
      documentationContentType: astridProject.documentationContentType,
      neededAmount: astridProject.neededAmount,
      currentAmount: astridProject.currentAmount,
      currency: astridProject.currency,
      supporters: astridProject.supporters,
      goal: astridProject.goal,
      statusReason: astridProject.statusReason,
      statusDeadline: astridProject.statusDeadline ? astridProject.statusDeadline.format(DATE_TIME_FORMAT) : null,
      entityCreationId: astridProject.entityCreationId,
      entityLastModificationId: astridProject.entityLastModificationId,
      responsibleId: astridProject.responsibleId,
      statusId: astridProject.statusId,
      locationId: astridProject.locationId,
      implementationTeams: astridProject.implementationTeams,
      beneficiaries: astridProject.beneficiaries,
    });
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(contentType: string, base64String: string): void {
    this.dataUtils.openFile(contentType, base64String);
  }

  setFileData(event: any, field: string, isImage: boolean): void {
    this.dataUtils.loadFileToForm(event, this.editForm, field, isImage).subscribe(null, (err: JhiFileLoadError) => {
      this.eventManager.broadcast(
        new JhiEventWithContent<AlertError>('projectsOverviewApp.error', { ...err, key: 'error.file.' + err.key })
      );
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const astridProject = this.createFromForm();
    if (astridProject.id !== undefined) {
      this.subscribeToSaveResponse(this.astridProjectService.update(astridProject));
    } else {
      this.subscribeToSaveResponse(this.astridProjectService.create(astridProject));
    }
  }

  private createFromForm(): IAstridProject {
    return {
      ...new AstridProject(),
      id: this.editForm.get(['id'])!.value,
      name: this.editForm.get(['name'])!.value,
      shortDescription: this.editForm.get(['shortDescription'])!.value,
      documentationContentType: this.editForm.get(['documentationContentType'])!.value,
      documentation: this.editForm.get(['documentation'])!.value,
      neededAmount: this.editForm.get(['neededAmount'])!.value,
      currentAmount: this.editForm.get(['currentAmount'])!.value,
      currency: this.editForm.get(['currency'])!.value,
      supporters: this.editForm.get(['supporters'])!.value,
      goal: this.editForm.get(['goal'])!.value,
      statusReason: this.editForm.get(['statusReason'])!.value,
      statusDeadline: this.editForm.get(['statusDeadline'])!.value
        ? moment(this.editForm.get(['statusDeadline'])!.value, DATE_TIME_FORMAT)
        : undefined,
      entityCreationId: this.editForm.get(['entityCreationId'])!.value,
      entityLastModificationId: this.editForm.get(['entityLastModificationId'])!.value,
      responsibleId: this.editForm.get(['responsibleId'])!.value,
      statusId: this.editForm.get(['statusId'])!.value,
      locationId: this.editForm.get(['locationId'])!.value,
      implementationTeams: this.editForm.get(['implementationTeams'])!.value,
      beneficiaries: this.editForm.get(['beneficiaries'])!.value,
    };
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IAstridProject>>): void {
    result.subscribe(
      () => this.onSaveSuccess(),
      () => this.onSaveError()
    );
  }

  protected onSaveSuccess(): void {
    this.isSaving = false;
    this.previousState();
  }

  protected onSaveError(): void {
    this.isSaving = false;
  }

  trackById(index: number, item: SelectableEntity): any {
    return item.id;
  }

  getSelected(selectedVals: SelectableManyToManyEntity[], option: SelectableManyToManyEntity): SelectableManyToManyEntity {
    if (selectedVals) {
      for (let i = 0; i < selectedVals.length; i++) {
        if (option.id === selectedVals[i].id) {
          return selectedVals[i];
        }
      }
    }
    return option;
  }
}