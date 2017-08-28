import { DisplayNamePipe } from "./display-name.pipe";
import { DisplayImagePipe } from "./display-image.pipe";
import { IsDriverPipe } from "./is-driver.pipe";
import { HideTextPipe } from "./hide-text.pipe";
import { KeyboardAttachDirective } from "./keyboard-attach.directive";
import { KeyboardFix } from "./keyboard-fix.directive";

export const SHARED_DECLARATIONS: any[] = [
	DisplayNamePipe,
	DisplayImagePipe,
	IsDriverPipe,
	HideTextPipe,
	KeyboardAttachDirective,
	KeyboardFix
]
